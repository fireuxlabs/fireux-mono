import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('migration', Path(__file__).with_name('app-context.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class AppContextMigrationTests(unittest.TestCase):
    def row(self):
        return {'name': 'projects/example/databases/example/documents/apps/app', 'appId': 'app',
                'appName': 'Example', 'ecosystemId': 'example', 'role': 'tenant', 'context': 'Reviewed background'}
    def document(self):
        return {'name': self.row()['name'], 'updateTime': 'revision', 'fields': {
            'name': {'stringValue': 'Example'}, 'ecosystem_id': {'stringValue': 'example'},
            'role': {'stringValue': 'tenant'}, 'prices': {'arrayValue': {'values': [{'integerValue': '15'}]}}}}
    def test_writes_only_context_with_exact_revision(self):
        write = m.build_write({'target': self.row(), 'before': self.document()})
        self.assertEqual(write['updateMask'], {'fieldPaths': ['context']})
        self.assertEqual(write['currentDocument'], {'updateTime': 'revision'})
        self.assertEqual(write['update']['fields'], {'context': {'stringValue': 'Reviewed background'}})
        for path in ['orders/18', 'apps/app/context/product', 'users/user']:
            row = {**self.row(), 'name': 'projects/example/databases/example/documents/' + path}
            with self.assertRaises(ValueError): m.build_write({'target': row, 'before': self.document()})
    def test_plan_preserves_authored_context_and_missing_records(self):
        row, document = self.row(), self.document()
        class Client:
            def request(self, path):
                if '/documents/' not in path: return {'type': 'FIRESTORE_NATIVE', 'databaseEdition': 'STANDARD'}
                return document
        client = Client()
        self.assertEqual(len(m.plan(client, [row])['changes']), 1)
        document['fields']['context'] = {'stringValue': 'Operator edit'}
        plan = m.plan(client, [row])
        self.assertFalse(plan['changes'])
        self.assertEqual(len(plan['conflicts']), 1)
        document = None
        self.assertEqual(m.plan(client, [row])['missing'], ['app'])
    def test_apply_refuses_changed_source_or_record_before_any_write(self):
        original = m.inventory
        m.inventory = lambda: [self.row()]
        calls = []
        class Client:
            def request(self, path, body=None):
                calls.append(body)
                return {'updateTime': 'different'}
        try:
            value = {'inventory': [self.row()], 'changes': [{'target': self.row(), 'before': self.document()}]}
            with self.assertRaisesRegex(ValueError, 'Source record changed'): m.apply(Client(), value)
            self.assertEqual(calls, [None])
            value['inventory'] = []
            with self.assertRaisesRegex(ValueError, 'Source or target inventory changed'): m.apply(Client(), value)
        finally: m.inventory = original

if __name__ == '__main__': unittest.main()
