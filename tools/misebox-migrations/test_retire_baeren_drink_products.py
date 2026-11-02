"""Offline data-loss boundaries for the exact Bären retirement operation."""
import copy
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('retirement', Path(__file__).with_name('retire-baeren-drink-products.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def value(v):
    if isinstance(v, dict):
        return {'mapValue': {'fields': {k: value(x) for k, x in v.items()}}}
    if isinstance(v, list):
        return {'arrayValue': {'values': [value(x) for x in v]}}
    if isinstance(v, (int, float)):
        return {'doubleValue': v}
    return {'stringValue': v}


def document(path, fields):
    return {'name': m.TARGET + '/documents/' + path, 'fields': {k: value(v) for k, v in fields.items()}, 'updateTime': '2026-11-01T00:00:00Z'}


def fixture():
    i = {k: [] for k in ['products', 'dishes', 'menus', 'sections', 'items', 'kitchen', 'place']}
    i.update(prices={}, children={}, priceChildren={}, referenceCounts={})
    parent = 'kitchens/' + m.KITCHEN
    i['menus'] = [document(parent + '/menus/menu', {'status': 'published'})]
    for key, mapping in m.MAPPING.items():
        i['products'].append(document('products/' + key, {'owner_type': 'kitchen', 'owner_id': m.KITCHEN, 'source_app_id': 'misebox-app', 'product_type': 'drink', 'created': {'by': m.ACTOR}, 'updated': {'by': m.ACTOR}, 'metadata': {'source': 'Hotel Baeren Ringgenberg current ordering system paste.', 'kitchen_id': m.KITCHEN, 'menu_id': 'delivery-ordering'}}))
        i['prices'][key] = [document('products/' + key + '/prices/default', {'provider': 'manual', 'currency': 'CHF', 'product_id': key, 'unit_amount': 500})]
        i['children'][key] = ['prices']
        i['priceChildren'][key] = []
        i['dishes'].append(document(parent + '/dishes/' + mapping['dish'], {'item_kind': 'drink', 'price': 5, 'bottle_deposit': mapping['deposit'], 'price_options': [{'label': 'Large', 'price': 10}]}))
        i['items'].append(document(parent + '/menus/menu/sections/drinks/items/' + key, {'dish_id': mapping['dish'], 'status': 'active'}))
    return i


class RetirementTests(unittest.TestCase):
    def plan(self, i=None):
        return m.build_plan(i or fixture(), 'source', m.BACKUP + 'drink-product-retirement-test')

    def test_exact_scope_and_richer_canonical_options_preserved(self):
        p = self.plan()
        self.assertEqual(len(p['retire']), 50)
        self.assertEqual({r['name'] for r in p['retire']}, m.target_names())
        self.assertEqual(len(p['comparisons']), 25)
        self.assertTrue(m.data(p['preserved'][0]).get('price_options'))

    def test_changed_commercial_terms_provenance_children_and_provider_stop(self):
        key = next(iter(m.MAPPING))
        for change in [
            lambda i: i['dishes'][0]['fields'].update(price=value(6)),
            lambda i: i['dishes'][0]['fields'].update(bottle_deposit=value(99)),
            lambda i: i['products'][0]['fields'].update(updated=value({'by': 'human'})),
            lambda i: i['children'][key].append('private'),
            lambda i: i['prices'][key][0]['fields'].update(provider_price_id=value('price_external')),
            lambda i: i['items'].clear(),
        ]:
            i = fixture()
            change(i)
            with self.assertRaises(RuntimeError):
                self.plan(i)

    def test_reference_identity_detection(self):
        key = next(iter(m.MAPPING))
        self.assertTrue(m.reference_hits({'order': [{'product_id': key}]}))
        self.assertTrue(m.reference_hits(m.TARGET + '/documents/products/' + key))
        self.assertFalse(m.reference_hits({'dish_id': m.MAPPING[key]['dish']}))

    def test_scope_tampering_rejected(self):
        p = self.plan()
        p['retire'][0]['name'] += '-other'
        with self.assertRaises(RuntimeError):
            m.validate_plan(p, 'source')

    def test_changed_dependency_prevents_commit(self):
        p = self.plan()
        class DB:
            calls = []
            def request(self, url, body=None):
                self.calls.append(url)
                if url.endswith(':beginTransaction'):
                    return {'transaction': 't'}
                if url.endswith(':batchGet'):
                    rows = copy.deepcopy(p['retire'] + p['preserved'])
                    rows[-1]['updateTime'] = 'changed'
                    return [{'found': r} for r in rows]
                return {}
        db = DB()
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(RuntimeError):
                m.apply_plan(db, p, Path(directory))
        self.assertFalse(any(x.endswith(':commit') for x in db.calls))
        self.assertTrue(db.calls[-1].endswith(':rollback'))

    def test_export_requires_exact_completed_destination_and_scope(self):
        p = self.plan()
        class DB:
            receipt = {'done': True, 'metadata': {'outputUriPrefix': p['backupPrefix'], 'collectionIds': ['products', 'prices']}}
            def request(self, url):
                return self.receipt
        db = DB()
        operation = m.TARGET + '/operations/test'
        m.require_export(db, p, operation)
        for receipt in [{'done': False}, {'done': True, 'metadata': {'outputUriPrefix': 'gs://other', 'collectionIds': ['products', 'prices']}}]:
            db.receipt = receipt
            with self.assertRaises(RuntimeError):
                m.require_export(db, p, operation)


if __name__ == '__main__':
    unittest.main()
