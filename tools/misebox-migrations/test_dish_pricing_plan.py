import copy
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('dish_pricing_plan', Path(__file__).with_name('dish-pricing-plan.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def inventory():
    root = 'kitchens/baren'
    return {
        'kitchen': {'id': 'baren', 'path': root},
        'menus': [{'id': 'food', 'data': {'status': 'published'}}],
        'sections': [{'path': root + '/menus/food/sections/pizza', 'data': {'status': 'active'}}],
        'catalogueDishes': [{'id': 'margherita', 'path': root + '/dishes/margherita', 'updateTime': 'dish-before', 'data': {'name': 'Margherita', 'kitchen_id': 'baren'}}],
        'menuItems': [{'path': root + '/menus/food/sections/pizza/items/item', 'updateTime': 'item-before', 'data': {'menu_id': 'food', 'section_id': 'pizza', 'dish_id': 'margherita', 'price': 13, 'price_options': [{'label': 'Large', 'quantity': 0, 'unit': '', 'price': 18}], 'add_ons': [{'id': 'cheese', 'label': 'Cheese', 'price': 2}], 'status': 'active', 'sort_order': 0}}],
    }


class DishPricingPlanTests(unittest.TestCase):
    def test_moves_exact_terms_and_preserves_scope_and_preimages(self):
        source = inventory()
        before = copy.deepcopy(source)
        plan = module.build_plan(source)
        self.assertEqual(source, before)
        self.assertEqual((plan['dishCount'], plan['placementCount']), (1, 1))
        dish, placement = plan['changes']
        for key in module.TERMS:
            self.assertEqual(dish['after'][key], source['menuItems'][0]['data'][key])
            self.assertNotIn(key, placement['after'])
        self.assertEqual(placement['after']['dish_id'], 'margherita')
        self.assertEqual(placement['after']['sort_order'], 0)
        self.assertEqual(placement['before'], source['menuItems'][0]['data'])
        self.assertEqual(dish['updateTime'], 'dish-before')

    def test_conflicting_current_placements_block_the_plan(self):
        source = inventory()
        other = copy.deepcopy(source['menuItems'][0])
        other['path'] += '-other'
        other['data']['price'] = 14
        source['menuItems'].append(other)
        with self.assertRaisesRegex(ValueError, 'Conflicting current pricing'):
            module.build_plan(source)

    def test_existing_dish_price_cannot_be_overwritten(self):
        source = inventory()
        source['catalogueDishes'][0]['data']['price'] = 15
        with self.assertRaisesRegex(ValueError, 'Existing Dish pricing conflicts'):
            module.build_plan(source)

    def test_archived_and_daily_records_are_retained(self):
        for menu_change in [{'status': 'archived'}]:
            source = inventory()
            source['menus'][0]['data'].update(menu_change)
            plan = module.build_plan(source)
            self.assertEqual(plan['changes'], [])
            self.assertEqual(len(plan['retainedHistoricalPlacements']), 1)

    def test_foreign_dishes_and_shared_bindings_require_review(self):
        for change in ['foreign', 'sellable']:
            source = inventory()
            if change == 'foreign':
                source['catalogueDishes'][0]['data']['kitchen_id'] = 'another'
            else:
                source['menuItems'][0]['data']['sellable_id'] = 'shared'
            with self.assertRaises(ValueError):
                module.build_plan(source)


if __name__ == '__main__':
    unittest.main()

class SparseMigrationWriteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location('apply_dish_pricing', Path(__file__).with_name('apply-dish-pricing.py'))
        cls.apply = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.apply)

    def test_sparse_writes_preserve_record_identity_and_require_current_preimage(self):
        plan = module.build_plan(inventory())
        dish, placement = [self.apply.build_write(change, '2026-10-16T00:00:00Z') for change in plan['changes']]
        self.assertEqual(dish['currentDocument'], {'updateTime': 'dish-before'})
        self.assertEqual(set(dish['update']['fields']), {'price', 'price_options', 'add_ons', 'updated'})
        self.assertEqual(placement['updateMask']['fieldPaths'], ['price', 'price_options', 'add_ons', 'updated'])
        self.assertEqual(set(placement['update']['fields']), {'updated'})

    def test_order_paths_and_unrelated_field_changes_are_rejected(self):
        change = module.build_plan(inventory())['changes'][0]
        for path in ['kitchens/baren/orders/18', 'orders/18', 'places/baren']:
            with self.assertRaises(ValueError):
                self.apply.build_write({**change, 'path': path}, '2026-10-16T00:00:00Z')
        with self.assertRaises(ValueError):
            self.apply.build_write({**change, 'after': {**change['after'], 'name': 'Changed'}}, '2026-10-16T00:00:00Z')

class PlannerCliTests(unittest.TestCase):
    def test_cli_emits_reviewed_batch_shape_and_requires_explicit_date(self):
        import json
        import subprocess
        import sys
        import tempfile
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / 'inventory.json'
            output = Path(directory) / 'plans.json'
            source.write_text(json.dumps(inventory()))
            subprocess.run([sys.executable, str(Path(__file__).with_name('dish-pricing-plan.py')),
                            '--inventory', str(source), '--output', str(output),
                            '--as-of-date', '2026-10-16'], check=True, capture_output=True)
            plans = json.loads(output.read_text())
            self.assertIsInstance(plans, list)
            self.assertEqual(len(plans), 1)
            self.assertEqual(plans[0]['dishCount'], 1)
