import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('kitchen_access', Path(__file__).with_name('kitchen-access.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
AT = {'seconds': 10, 'nanoseconds': 20}


def inventory():
    return {'database': module.DATABASE, 'inventoried_apps': sorted(module.APPS),
            'documents': [{'path': f'kitchen_access/{app}/users/u', 'data': {'ids': [id], 'membership_created_at': AT},
                           'membership': {'role': 'user', 'created': {'at': AT}}, 'update_time': 'revision', 'membership_update_time': 'member-revision'}
                          for app, id in [('misebox-app', 'k1'), ('la-tap-berne', 'k2')]],
            'destinations': [{'path': 'kitchen_access/u', 'exists': False, 'data': None}]}


class KitchenAccessPlanTest(unittest.TestCase):
    def test_merge_preserves_app_entries_and_complete_preimages(self):
        source = inventory()
        before = copy.deepcopy(source)
        plan = module.build_plan(source)
        self.assertEqual(source, before)
        self.assertEqual(set(plan['entries'][0]['data']['apps']), {'misebox-app', 'la-tap-berne'})
        self.assertEqual(plan['entries'][0]['precondition'], {'exists': False})
        self.assertEqual(len(plan['preimages']), 2)
        self.assertFalse(plan['apply_supported'])

    def test_conflict_blocks_retirement_without_overwriting_existing_target(self):
        source = inventory()
        source['destinations'][0].update(exists=True, data={'apps': {}}, update_time='existing')
        plan = module.build_plan(source)
        self.assertEqual(plan['entries'][0]['status'], 'conflict')
        self.assertEqual(plan['entries'][0]['retirement_proposals'], [])
        self.assertIsNone(plan['entries'][0]['precondition'])

    def test_rejoin_malformed_scope_and_incomplete_inventory_fail(self):
        for change in [lambda x: x.update(database='wrong'), lambda x: x.update(inventoried_apps=['misebox-app']),
                       lambda x: x.update(destinations=[]), lambda x: x['documents'].append(copy.deepcopy(x['documents'][0])),
                       lambda x: x['documents'][0]['membership']['created'].update(at={'seconds': 11, 'nanoseconds': 20}),
                       lambda x: x['documents'][0]['data'].update(ids=['k1'] * 2),
                       lambda x: x['documents'][0]['data'].update(ids=[f'k{i}' for i in range(51)]),
                       lambda x: x['documents'][0].update(path='kitchen_access/unknown/users/u')]:
            source = inventory()
            change(source)
            with self.assertRaises(ValueError):
                module.build_plan(source)


if __name__ == '__main__':
    unittest.main()
