import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('portfolio_identity', Path(__file__).with_name('portfolio-identity.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def root():
    return {'management': {'mode': 'workspace'}, 'name': 'Portfolio', 'tagline': '', 'image_url': '', 'slug': 'p',
            'status': 'active', 'owner_label': 'Private owner', 'strategy_label': 'Private strategy', 'region_label': 'Bern',
            'notes': 'Private notes', 'created': {'at': {'seconds': 1}}, 'updated': {'at': {'seconds': 2}}}


def plan(value):
    return module.build_plan({'database': module.DATABASE, 'documents': [{'path': 'portfolios/p', 'data': value, 'update_time': 'revision'}]})


class PortfolioPlanTests(unittest.TestCase):
    def test_exact_cutover_preserves_preimages_authority_and_private_context_without_adding_stored_id(self):
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
        for key in ['management', 'created', 'updated']:
            self.assertEqual(after[key], original[key])
        self.assertEqual(after['identity']['notes'], 'Private notes')
        self.assertFalse(set(after) & module.IDENTITY_FIELDS)
        self.assertNotIn('id', after)
        self.assertEqual(module.propose(after, 'p'), ('already_nested', after))
        self.assertFalse(result['apply_supported'])
        self.assertTrue(result['target_validation_required'])

    def test_archived_publication_and_empty_text_remain_explicit(self):
        before = root()
        before.update(status='archived', notes='')
        after = plan(before)['entries'][0]['proposed']
        self.assertEqual(after['identity']['status'], 'archived')
        self.assertEqual(after['identity']['notes'], '')

    def test_conflicting_partial_invalid_or_unknown_fields_are_not_dropped(self):
        for mutate in [lambda v: v.update(identity={'name': 'Other'}), lambda v: v.pop('slug'),
                       lambda v: v.update(secret='Retain'), lambda v: v.update(name=5),
                       lambda v: v.update(status='other'), lambda v: v.update(slug='other')]:
            before = root()
            mutate(before)
            entry = plan(before)['entries'][0]
            self.assertEqual(entry['status'], 'invalid')
            self.assertEqual(entry['preimage'], before)
            self.assertIsNone(entry['proposed'])

    def test_utf16_text_limits_match_the_runtime(self):
        for field, maximum in module.LIMITS.items():
            for count, valid in [(maximum // 2, True), (maximum // 2 + 1, False)]:
                before = root()
                before[field] = '😀' * count
                document_id = before['slug'] if field == 'slug' else 'p'
                if valid:
                    self.assertEqual(module.propose(before, document_id)[0], 'proposed')
                else:
                    with self.assertRaises(ValueError):
                        module.propose(before, document_id)

    def test_foreign_database_duplicate_document_and_conflicting_id_are_rejected(self):
        document = {'path': 'portfolios/p', 'data': root()}
        for inventory in [{'database': 'projects/other/databases/granite', 'documents': [document]},
                          {'database': module.DATABASE, 'documents': [document, document]},
                          {'database': module.DATABASE, 'documents': [{**document, 'path': 'portfolios/p/tasks/task'}]},
                          {'database': module.DATABASE, 'documents': [{**document, 'data': {**root(), 'id': 'other'}}]}]:
            with self.assertRaises(ValueError):
                module.build_plan(inventory)


if __name__ == '__main__':
    unittest.main()
