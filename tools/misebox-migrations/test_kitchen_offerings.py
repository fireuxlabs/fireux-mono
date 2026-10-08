import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('kitchen_offerings', Path(__file__).with_name('kitchen-offerings.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def offering():
    return {'id': 'pickup', 'name': 'Pickup', 'enabled': False, 'menu_ids': [], 'interactions': [{'type': 'browse', 'enabled': True}]}


def inventory(rows=None):
    return {'database': module.DATABASE, 'documents': [{'path': 'kitchens/k', 'data': {'identity': {'slug': 'k'}, 'created': {'by': 'u'}, 'services': [offering()] if rows is None else rows}, 'update_time': 'revision'}]}


class OfferingPlanTests(unittest.TestCase):
    def test_preserves_exact_preimages_revisions_and_other_root_fields(self):
        source = inventory()
        before = copy.deepcopy(source)
        plan = module.build_plan(source)
        self.assertEqual(source, before)
        self.assertEqual(plan['preimages'][0]['data'], before['documents'][0]['data'])
        self.assertEqual(plan['preimages'][0]['update_time'], 'revision')
        self.assertEqual(plan['preimages'][0]['sha256'], module.digest(before['documents'][0]['data']))
        entry = plan['entries'][0]
        self.assertEqual(entry['status'], 'needs_target_validation')
        child = entry['create_only_children'][0]
        self.assertEqual(child['path'], 'kitchens/k/offerings/pickup')
        self.assertEqual(child['precondition'], {'exists': False})
        self.assertNotIn('id', child['data'])
        self.assertEqual(entry['root_proposal']['data'], {'identity': {'slug': 'k'}, 'created': {'by': 'u'}})
        self.assertFalse(plan['apply_supported'])
        self.assertTrue(plan['target_validation_required'])

    def test_existing_identical_child_never_creates_or_overwrites(self):
        source = inventory()
        data = offering()
        del data['id']
        source['documents'].append({'path': 'kitchens/k/offerings/pickup', 'data': data, 'update_time': 'child-revision'})
        plan = module.build_plan(source)
        self.assertEqual(plan['entries'][0]['create_only_children'], [])
        self.assertEqual(plan['preimages'][1]['update_time'], 'child-revision')

    def test_conflicting_child_and_duplicate_identity_block_all_proposals(self):
        for source in [inventory([offering(), offering()]), inventory()]:
            if len(source['documents'][0]['data']['services']) == 1:
                source['documents'].append({'path': 'kitchens/k/offerings/pickup', 'data': {'name': 'Other'}})
            entry = module.build_plan(source)['entries'][0]
            self.assertEqual(entry['status'], 'conflict')
            self.assertEqual(entry['create_only_children'], [])
            self.assertIsNone(entry['root_proposal'])

    def test_empty_array_and_already_child_only_remain_distinct(self):
        self.assertEqual(module.build_plan(inventory([]))['entries'][0]['status'], 'needs_target_validation')
        source = inventory()
        del source['documents'][0]['data']['services']
        self.assertEqual(module.build_plan(source)['entries'][0]['status'], 'no_root_array')

    def test_wrong_target_duplicate_path_and_orphan_child_reject(self):
        for mutate in [lambda s: s.update(database='projects/other/databases/misebox'),
                       lambda s: s['documents'].append(copy.deepcopy(s['documents'][0])),
                       lambda s: s['documents'].append({'path':'kitchens/other/offerings/pickup','data':{}}),
                       lambda s: s['documents'][0].update(path='kitchens/k/menus/m')]:
            source = inventory()
            mutate(source)
            with self.assertRaises(ValueError):
                module.build_plan(source)

    def test_invalid_root_array_and_bad_ids_never_emit_writes(self):
        for rows in [None, {'not': 'array'}, [{'id': '../other'}], [{'id': ''}], [{'name': 'Missing identity'}]]:
            source = inventory()
            source['documents'][0]['data']['services'] = rows
            entry = module.build_plan(source)['entries'][0]
            self.assertIn(entry['status'], ['invalid', 'conflict'])
            self.assertEqual(entry['create_only_children'], [])
            self.assertIsNone(entry['root_proposal'])


if __name__ == '__main__':
    unittest.main()
