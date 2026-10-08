import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('property_identity', Path(__file__).with_name('property-identity.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def root():
    return {'id': 'p', 'portfolio_id': 'portfolio', 'place_id': 'place', 'management': {'mode': 'workspace'},
            'slug': 'home', 'status': 'active', 'publication_state': 'published',
            'identity': {'name': 'Home', 'image_url': '', 'property_type': 'residential', 'unit_count': 1,
                         'estimated_value': 100, 'estimated_value_currency': 'CHF'},
            'created': {'at': {'seconds': 1}, 'by': 'u'}, 'updated': {'at': {'seconds': 2}, 'by': 'u'}}


class PropertyPlanTests(unittest.TestCase):
    def test_preserves_preimage_and_relationships_while_proposing_exact_cutover(self):
        before = root()
        original = copy.deepcopy(before)
        plan = module.build_plan({'database': 'projects/buenohost-ecosystem/databases/buenohost',
                                  'documents': [{'path': 'properties/p', 'data': before, 'update_time': 'revision'}]})
        entry = plan['entries'][0]
        self.assertEqual(before, original)
        self.assertEqual(entry['preimage'], original)
        self.assertEqual(entry['status'], 'proposed')
        after = entry['proposed']
        for key in ['id', 'portfolio_id', 'place_id', 'management', 'created', 'updated']:
            self.assertEqual(after[key], original[key])
        self.assertEqual(after['identity']['publication_state'], 'published')
        self.assertEqual(after['valuation'], {'estimated_value': 100, 'currency_code': 'CHF'})
        self.assertFalse(set(after) & module.PUBLICATION_KEYS)
        self.assertFalse(set(after['identity']) & module.OLD_PRICE_KEYS)
        self.assertEqual(module.propose(after)[0], 'already_nested')
        self.assertFalse(plan['apply_supported'])
        self.assertTrue(plan['target_validation_required'])

    def test_missing_stored_id_keeps_exact_preimage_and_uses_document_path(self):
        before = root()
        del before['id']
        plan = module.build_plan({'database': 'projects/buenohost-ecosystem/databases/buenohost',
                                  'documents': [{'path': 'properties/p', 'data': before}]})
        entry = plan['entries'][0]
        self.assertEqual(entry['status'], 'proposed')
        self.assertEqual(entry['preimage'], before)
        self.assertEqual(entry['preimage_sha256'], module.digest(before))
        self.assertNotIn('id', entry['preimage'])
        self.assertNotIn('id', entry['proposed'])
        self.assertEqual(entry['path'], 'properties/p')

    def test_unknown_currency_is_review_required_without_inventing_a_fact(self):
        before = root()
        before['identity'].update(estimated_value=0, estimated_value_currency='')
        status, after, warnings = module.propose(before)
        self.assertEqual(status, 'review_required')
        self.assertIsNone(after)
        self.assertTrue(warnings)
        self.assertEqual(before['identity']['estimated_value'], 0)

    def test_explicit_zero_is_preserved_but_requires_confirmation(self):
        before = root()
        before['identity']['estimated_value'] = 0
        status, after, _ = module.propose(before)
        self.assertEqual(status, 'review_required')
        self.assertEqual(after['valuation']['estimated_value'], 0)

    def test_conflicting_authorities_and_unknown_fields_are_not_dropped(self):
        for mutation in [lambda value: value['identity'].update(slug='other'),
                         lambda value: value.update(valuation={'estimated_value': 100, 'currency_code': 'CHF'}),
                         lambda value: value.update(secret='retained in preimage')]:
            before = root()
            mutation(before)
            plan = module.build_plan({'database': 'projects/granite-ecosystem/databases/granite',
                                      'documents': [{'path': 'properties/p', 'data': before}]})
            self.assertEqual(plan['entries'][0]['status'], 'invalid')
            self.assertEqual(plan['entries'][0]['preimage'], before)
            self.assertIsNone(plan['entries'][0]['proposed'])

    def test_wrong_targets_and_duplicate_documents_are_rejected(self):
        doc = {'path': 'properties/p', 'data': root()}
        for inventory in [{'database': 'buenohost', 'documents': [doc]},
                          {'database': 'projects/p/databases/db', 'documents': [doc, doc]},
                          {'database': 'projects/p/databases/db', 'documents': [{**doc, 'path': 'properties/other'}]}]:
            with self.assertRaises(ValueError):
                module.build_plan(inventory)


if __name__ == '__main__':
    unittest.main()
