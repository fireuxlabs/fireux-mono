import importlib.util
import unittest
from copy import deepcopy
from pathlib import Path
spec = importlib.util.spec_from_file_location('ordering', Path(__file__).with_name('kitchen-ordering.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def doc(path, data):
    return {'name': m.TARGET + '/documents/' + path, 'updateTime': 'unchanged', 'fields': {k: m.encode(v) for k, v in data.items()}}

def kitchen(kid='k'):
    return doc('kitchens/' + kid, {'currency': 'CHF'})

def menu(mid, policy, kid='k', **extra):
    return doc('kitchens/' + kid + '/menus/' + mid, {'name': mid, 'slug': mid, 'status': 'published', 'ordering': policy, 'created': {'by': 'original'}, **extra})

class MigrationTests(unittest.TestCase):

    def test_merge_and_rerun_preserves_all_other_data(self):
        policy = {'enabled': True, 'order_types': [{'type': 'collection', 'notice_hours': '2'}]}
        inventory = {'kitchens': [kitchen()], 'menus': [menu('food', policy), menu('drinks', policy)]}
        plan = m.build_plan(inventory)
        self.assertFalse(plan['issues'])
        self.assertEqual(len(plan['changes']), 3)
        service = m.decode(plan['changes'][0]['after']['ordering'])['services'][0]
        self.assertEqual(service['menu_ids'], ['food', 'drinks'])
        self.assertTrue(service['enabled'])
        for change in plan['changes'][1:]:
            self.assertNotIn('ordering', change['after'])
            self.assertEqual({k: v for k, v in change['before'].items() if k != 'ordering'}, change['after'])
        for record in inventory['kitchens'] + inventory['menus']:
            record['fields'] = next((c['after'] for c in plan['changes'] if c['name'] == record['name']))
        self.assertEqual(m.build_plan(inventory)['changes'], [])

    def test_conflicting_policies_block_apply(self):
        a = {'enabled': True, 'order_types': [{'type': 'collection', 'notice_hours': 1}]}
        b = deepcopy(a)
        b['order_types'][0]['notice_hours'] = 2
        self.assertTrue(m.build_plan({'kitchens': [kitchen()], 'menus': [menu('a', a), menu('b', b)]})['issues'])

    def test_la_tap_never_revives_archived_policy(self):
        hours = {'inherit_kitchen_operation_hours': False, 'operation_hours': {'timezone': 'Europe/Zurich', 'windows': [{'days': ['friday'], 'open': '17:00', 'close': '22:00'}]}}
        active = menu('food', {'enabled': False, 'service_hours': hours}, m.LA_TAP)
        archived = menu('main', {'enabled': True, 'order_types': [{'type': 'pre_order', 'fulfilment': {'deposit': {'type': 'fixed', 'amount': 5}}}]}, m.LA_TAP, status='archived')
        plan = m.build_plan({'kitchens': [kitchen(m.LA_TAP)], 'menus': [active, archived]})
        service = m.decode(plan['changes'][0]['after']['ordering'])['services'][0]
        self.assertFalse(service['enabled'])
        self.assertEqual(service['menu_ids'], ['food'])
        self.assertNotIn('fulfilment', service)
        self.assertEqual(service['service_hours'], hours)

    def test_mixed_enablement_requires_review(self):
        a = {'enabled': True, 'order_types': [{'type': 'collection'}]}
        b = {**a, 'enabled': False}
        self.assertTrue(m.build_plan({'kitchens': [kitchen()], 'menus': [menu('a', a), menu('b', b)]})['issues'])

class RunnerTests(unittest.TestCase):
    def test_changed_preimage_prevents_every_write(self):
        from kitchen_ordering_runner import apply_plan
        calls = []
        before = {'currency': {'stringValue': 'CHF'}}
        after = {**before, 'ordering': m.encode({'services': []})}
        change = {
            'name': m.TARGET + '/documents/kitchens/k',
            'updateTime': 'reviewed', 'before': before, 'after': after,
            'changed': ['ordering'],
        }

        def request(url, data=None):
            calls.append((url, data))
            return {'fields': before, 'updateTime': 'changed'}

        with self.assertRaisesRegex(RuntimeError, 'Record changed since review'):
            apply_plan(request, {'changes': [change], 'issues': []})
        self.assertEqual(len(calls), 1)
        self.assertIsNone(calls[0][1])

    def test_export_requires_exact_destination_and_scope(self):
        from kitchen_ordering_runner import BACKUP, require_completed_export
        export = {
            'done': True,
            'metadata': {'outputUriPrefix': BACKUP, 'collectionIds': ['kitchens', 'menus']},
        }
        operation = m.TARGET + '/operations/reviewed'
        self.assertEqual(require_completed_export(lambda _: export, operation), export)
        export['metadata']['outputUriPrefix'] = BACKUP + '-different'
        with self.assertRaisesRegex(RuntimeError, 'Backup destination differs'):
            require_completed_export(lambda _: export, operation)

if __name__ == '__main__':
    unittest.main()
