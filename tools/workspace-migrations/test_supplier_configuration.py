import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('supplier_configuration', Path(__file__).with_name('supplier-configuration.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def root():
    return {'company_id': 'company', 'management': {'mode': 'workspace'},
            'slug': 'supplier', 'status': 'active', 'visibility': True,
            'catalogue_state': 'integrated', 'delivery_areas': ['Bern'],
            'created': {'at': {'seconds': 1}, 'by': 'u'}, 'updated': {'at': {'seconds': 2}, 'by': 'u'}}


def plan(data):
    return module.build_plan({'database': module.DATABASE, 'documents': [{'path': 'suppliers/supplier', 'data': data, 'update_time': 'revision'}]})


class SupplierPlanTests(unittest.TestCase):
    def test_exact_cutover_preserves_relationships_and_preimages_without_adding_stored_id(self):
        before = root()
        original = copy.deepcopy(before)
        result = plan(before)
        entry = result['entries'][0]
        self.assertEqual(entry['status'], 'proposed')
        self.assertEqual(entry['preimage'], original)
        self.assertEqual(entry['preimage_sha256'], module.digest(original))
        self.assertEqual(entry['update_time'], 'revision')
        self.assertEqual(before, original)
        after = entry['proposed']
        for key in ['company_id', 'management', 'created', 'updated']:
            self.assertEqual(after[key], original[key])
        self.assertEqual(after['identity'], {'slug': 'supplier', 'status': 'active', 'visibility': True})
        self.assertEqual(after['catalogue'], {'mode': 'integrated'})
        self.assertEqual(after['delivery'], {'areas': ['Bern']})
        self.assertFalse(set(after) & module.OLD_KEYS)
        self.assertNotIn('id', after)
        self.assertEqual(module.propose(after), ('already_nested', after))
        self.assertFalse(result['apply_supported'])
        self.assertTrue(result['target_validation_required'])

    def test_false_visibility_and_empty_delivery_are_preserved(self):
        before = root()
        before.update(visibility=False, delivery_areas=[])
        after = plan(before)['entries'][0]['proposed']
        self.assertIs(after['identity']['visibility'], False)
        self.assertEqual(after['delivery']['areas'], [])

    def test_mixed_partial_unknown_or_invalid_fields_are_preserved_as_invalid_preimages(self):
        mutations = [lambda value: value.update(identity={'slug': 'other'}),
                     lambda value: value.pop('slug'),
                     lambda value: value.update(secret='do not drop'),
                     lambda value: value.update(visibility='true'),
                     lambda value: value.update(catalogue_state='other'),
                     lambda value: value.update(delivery_areas=[12]),
                     lambda value: value.update(status=['active'])]
        for mutate in mutations:
            before = root()
            mutate(before)
            entry = plan(before)['entries'][0]
            self.assertEqual(entry['status'], 'invalid')
            self.assertEqual(entry['preimage'], before)
            self.assertIsNone(entry['proposed'])

    def test_utf16_slug_and_delivery_limits_match_the_runtime(self):
        for count, valid in [(100, True), (101, False)]:
            before = root()
            before['slug'] = '😀' * count
            self.assertEqual(plan(before)['entries'][0]['status'], 'proposed' if valid else 'invalid')
        for count, valid in [(80, True), (81, False)]:
            before = root()
            before['delivery_areas'] = ['😀' * count]
            self.assertEqual(plan(before)['entries'][0]['status'], 'proposed' if valid else 'invalid')

    def test_wrong_database_duplicate_path_and_conflicting_stored_id_are_rejected(self):
        document = {'path': 'suppliers/supplier', 'data': root()}
        for inventory in [{'database': 'projects/misebox-78f9c/databases/misebox', 'documents': [document]},
                          {'database': module.DATABASE, 'documents': [document, document]},
                          {'database': module.DATABASE, 'documents': [{**document, 'path': 'suppliers/supplier/items/item'}]},
                          {'database': module.DATABASE, 'documents': [{**document, 'data': {**root(), 'id': 'other'}}]}]:
            with self.assertRaises(ValueError):
                module.build_plan(inventory)


if __name__ == '__main__':
    unittest.main()
