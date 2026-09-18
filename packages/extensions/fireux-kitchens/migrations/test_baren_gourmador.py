import copy
import importlib.util
import json
from pathlib import Path
import unittest
import urllib.error

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('baren_gourmador', HERE / 'baren-gourmador.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class GourmadorMigrationTests(unittest.TestCase):
    def setUp(self):
        self.spec = json.loads(m.SPEC.read_text())
        self.ids = json.loads(m.INGREDIENT_SPEC.read_text())['kitchen_ingredient_ids']
        self.inventory = {'kitchen': {'name': f'{m.TARGET}/documents/kitchens/{m.KITCHEN}'},
            'ingredients': [{'name': f'{m.TARGET}/documents/ingredients/{id}', 'fields': {'status': m.encode('active')}} for id in self.ids],
            'kitchen_ingredients': [{'fields': {'ingredient_id': m.encode(id)}} for id in self.ids],
            'kitchen_supplier_ingredients': [], 'targets': {}}
    def plan(self):
        return m.build_plan(self.inventory, self.spec, self.ids, '2026-09-18T00:00:00Z')
    def test_exact_creates_without_offers_or_access(self):
        plan = self.plan()
        m.validate_plan(plan, self.ids)
        self.assertEqual(len(plan['changes']), 70)
        self.assertFalse(plan['issues'])
        names = [x['name'] for x in plan['changes']]
        self.assertFalse(any('/access/' in n or '/items/' in n or f'/suppliers/{m.SUPPLIER}/ingredients/' in n for n in names))
    def test_missing_usage_blocks(self):
        self.inventory['kitchen_ingredients'].pop()
        with self.assertRaises(ValueError): m.validate_plan(self.plan(), self.ids)
    def test_supplier_identity_cannot_be_written_to_misebox(self):
        plan = self.plan()
        roots = [c for c in plan['changes'] if '/documents/kitchens/' not in c['name']]
        self.assertEqual(len(roots), 3)
        self.assertTrue(all(c['name'].startswith(m.SUPPLIER_TARGET + '/') for c in roots))
        roots[0]['name'] = roots[0]['name'].replace(m.SUPPLIER_TARGET, m.TARGET)
        with self.assertRaises(ValueError): m.validate_plan(plan, self.ids)
    def test_retired_ingredient_blocks(self):
        self.inventory['ingredients'][0]['fields']['status'] = m.encode('deprecated')
        with self.assertRaises(ValueError): m.validate_plan(self.plan(), self.ids)
    def test_existing_link_is_not_duplicated(self):
        self.inventory['kitchen_supplier_ingredients'] = [{'fields': m.fields({'supplier_id': m.SUPPLIER, 'ingredient_id': self.ids[0]})}]
        self.assertEqual(len(self.plan()['changes']), 69)
    def test_existing_identity_conflict_blocks(self):
        self.inventory['targets'][f'places/{m.PLACE}'] = {'fields': {'name': m.encode('Different company')}}
        with self.assertRaises(ValueError): m.validate_plan(self.plan(), self.ids)
    def test_other_kitchen_or_access_target_rejected(self):
        for name in [f'{m.TARGET}/documents/kitchens/other/suppliers/{m.SUPPLIER}', f'{m.TARGET}/documents/suppliers/{m.SUPPLIER}/access/user']:
            plan = self.plan(); plan['changes'][0]['name'] = name
            with self.assertRaises(ValueError): m.validate_plan(plan, self.ids)
    def test_owner_first_commits_with_create_preconditions(self):
        calls = []
        def request(url, data=None):
            if data is not None: calls.append(data); return {}
            raise urllib.error.HTTPError(url, 404, 'not found', {}, None)
        self.assertEqual(m.apply_plan(request, self.plan(), self.ids)['applied'], 70)
        self.assertEqual(len(calls), 2)
        self.assertTrue(calls[0]['writes'][0]['update']['name'].startswith(m.SUPPLIER_TARGET))
        self.assertTrue(all(w['currentDocument'] == {'exists': False} for call in calls for w in call['writes']))
    def test_conflicting_create_aborts_before_commit(self):
        calls = []
        def request(url, data=None):
            if data is not None: calls.append(data)
            return {'fields': {'unexpected': m.encode('existing')}}
        with self.assertRaises(RuntimeError): m.apply_plan(request, self.plan(), self.ids)
        self.assertFalse(calls)
    def test_replay_has_no_writes(self):
        plan = self.plan()
        actual = {'https://firestore.googleapis.com/v1/' + c['name']: {'fields': c['after']} for c in plan['changes']}
        self.assertEqual(m.apply_plan(lambda url: actual[url], plan, self.ids)['applied'], 0)
    def test_replan_preserves_created_records(self):
        plan = self.plan()
        for c in plan['changes']:
            path = c['name'].split('/documents/')[1]
            self.inventory['targets'][path] = {'fields': c['after']}
            if '/supplier-ingredients/' in path:
                self.inventory['kitchen_supplier_ingredients'].append({'fields': c['after']})
        self.assertEqual(self.plan()['changes'], [])

if __name__ == '__main__': unittest.main()
