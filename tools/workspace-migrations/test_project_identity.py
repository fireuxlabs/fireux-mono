import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('project_identity', Path(__file__).with_name('project-identity.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def root():
    return {'name':'Idea', 'description':'', 'image_url':'', 'status':'inactive',
            'created':{'at':{'seconds':1,'nanoseconds':0}}, 'updated':{'at':{'seconds':2,'nanoseconds':0}}}


def plan(value, path='projects/p'):
    return m.build_plan({'database':m.DATABASE, 'documents':[{'path':path, 'data':value, 'update_time':'revision'}]})


class ProjectPlanTests(unittest.TestCase):
    def test_preserves_exact_facts_preimages_and_revision_without_inventing_id(self):
        before = root()
        original = copy.deepcopy(before)
        result = plan(before)
        entry = result['entries'][0]
        self.assertEqual(entry['status'], 'proposed')
        self.assertEqual(entry['preimage'], original)
        self.assertEqual(entry['preimage_sha256'], m.digest(original))
        self.assertEqual(entry['update_time'], 'revision')
        self.assertEqual(before, original)
        after = entry['proposed']
        self.assertEqual(after['identity'], {k:original[k] for k in m.IDENTITY_FIELDS})
        self.assertEqual(after['created'], original['created'])
        self.assertNotIn('id', after)
        self.assertEqual(m.propose(after, 'p'), ('already_nested', after))
        self.assertFalse(result['apply_supported'])
        self.assertTrue(result['target_validation_required'])

    def test_guest_authority_preserved_exactly_and_conflicts_rejected(self):
        before = root()
        before.update(guest_owner_uid='p')
        before['created'].update(by='p', app_id='app')
        self.assertEqual(plan(before)['entries'][0]['proposed']['guest_owner_uid'], 'p')
        before['created']['by'] = 'other'
        self.assertEqual(plan(before)['entries'][0]['status'], 'invalid')

    def test_partial_mixed_unknown_and_invalid_values_not_silently_dropped(self):
        for mutate in [lambda v:v.update(identity={'name':'other'}), lambda v:v.pop('status'),
                       lambda v:v.update(team=[]), lambda v:v.update(name=3),
                       lambda v:v.update(status='other'), lambda v:v.update(created={})]:
            before = root()
            mutate(before)
            entry = plan(before)['entries'][0]
            self.assertEqual(entry['status'], 'invalid')
            self.assertEqual(entry['preimage'], before)
            self.assertIsNone(entry['proposed'])

    def test_utf16_limits_match_javascript_for_supplementary_characters(self):
        for field, units in [('name', 120), ('description', 2000), ('image_url', 2048)]:
            before = root()
            before[field] = '😀' * (units // 2)
            self.assertEqual(plan(before)['entries'][0]['status'], 'proposed')
            before[field] += '😀'
            self.assertEqual(plan(before)['entries'][0]['status'], 'invalid')

    def test_target_paths_duplicates_and_mismatched_stored_id_rejected(self):
        document={'path':'projects/p','data':root()}
        for inventory in [{'database':'projects/other/databases/fireux','documents':[document]},
                          {'database':m.DATABASE,'documents':[document,document]},
                          {'database':m.DATABASE,'documents':[{**document,'path':'projects/p/team/u'}]},
                          {'database':m.DATABASE,'documents':[{**document,'data':{**root(),'id':'other'}}]}]:
            with self.assertRaises(ValueError):
                m.build_plan(inventory)


if __name__ == '__main__':
    unittest.main()
