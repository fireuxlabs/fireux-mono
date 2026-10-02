import importlib.util
from pathlib import Path
import unittest
from copy import deepcopy
import urllib.error

import named_services_runner as runner

spec = importlib.util.spec_from_file_location('named_services', Path(__file__).with_name('named-services.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def doc(path, data):
    return {'name': f'{m.TARGET}/documents/{path}', 'updateTime': 'reviewed', 'fields': {k: m.encode(v) for k, v in data.items()}}


def hours(open='09:00', source='custom'):
    return {'source': source, 'timezone': 'Europe/Zurich', 'windows': [{'days': ['friday'], 'open': open, 'close': '22:00'}]}


def policy(mode='pre_order', enabled=False, **extra):
    return {'type': mode, 'enabled': enabled, 'menu_ids': ['food'], **extra}


def inventory(services=None, **extra):
    return {'kitchens': [doc('kitchens/k', {'ordering': {'services': services or [policy()]}, **extra})], 'places': []}


def services(plan):
    return m.decode(plan['changes'][0]['after']['services'])


class TransformerTests(unittest.TestCase):
    def test_disabled_preorder_stays_disabled_with_browse(self):
        plan = m.build_plan(inventory())
        self.assertFalse(plan['issues'])
        service = services(plan)[0]
        self.assertEqual(service, {
            'id': 'service-pre-order', 'name': 'Pre-order', 'enabled': False,
            'menu_ids': ['food'], 'interactions': [
                {'type': 'browse', 'enabled': True}, {'type': 'pre_order', 'enabled': False},
            ],
        })

    def test_custom_hours_and_explicit_inherited_snapshot(self):
        custom = hours('17:00')
        data = inventory([
            policy('pre_order', True, service_hours={'inherit_kitchen_operation_hours': False, 'operation_hours': custom}),
            policy('collection', True, service_hours={'inherit_kitchen_operation_hours': True}),
        ], orders={'operation_hours': hours('10:00')})
        plan = m.build_plan(data)
        self.assertFalse(plan['issues'])
        self.assertEqual([s['hours'] for s in services(plan)], [custom, hours('10:00')])
        self.assertFalse(m.needs_place(data['kitchens'][0]))

    def test_place_fallback_uses_same_resolver_and_snapshots_timezone(self):
        data = inventory([policy('delivery', True)], orders={'operation_hours': hours('02:00', 'place')})
        data['places'] = [doc('places/k', {'timezone': 'Europe/Zurich', 'business_hours': {'windows': [{'days': ['Friday'], 'open': '0900', 'close': '2200'}]}})]
        self.assertTrue(m.needs_place(data['kitchens'][0]))
        plan = m.build_plan(data)
        self.assertFalse(plan['issues'])
        self.assertEqual(services(plan)[0]['hours'], hours(source='place'))
        self.assertEqual(plan['dependencies'], data['places'])

    def test_multiple_modes_preserve_policy_menu_ids_and_raw_provenance(self):
        data = inventory([
            policy('pre_order', False, availability={'paused': True, 'message': 'Closed'}, menu_ids=['z', 'a'], fulfilment={'deposit': {'type': 'fixed', 'amount': 5}}, notifications={'whatsapp': {'enabled': True, 'recipient_phone': '+41000000000'}}),
            policy('collection', True, notice_hours=2, service_hours={'operation_hours': hours()}),
        ], orders={'service_id': 'operational-numbering'}, created={'by': 'original'}, source={'app_id': 'original-app'})
        original = deepcopy(data)
        raw = data['kitchens'][0]['fields']['ordering']['mapValue']['fields']['services']['arrayValue']['values'][0]['mapValue']['fields']
        raw['future_policy'] = {'timestampValue': '2025-01-01T00:00:00Z'}
        plan = m.build_plan(data)
        self.assertFalse(plan['issues'])
        named = plan['changes'][0]['after']['services']['arrayValue']['values']
        interaction = named[0]['mapValue']['fields']['interactions']['arrayValue']['values'][1]['mapValue']['fields']
        self.assertEqual(interaction, {k: v for k, v in raw.items() if k not in {'menu_ids', 'service_hours'}})
        self.assertEqual(named[0]['mapValue']['fields']['menu_ids'], raw['menu_ids'])
        self.assertEqual({k: v for k, v in plan['changes'][0]['after'].items() if k != 'services'}, {k: v for k, v in original['kitchens'][0]['fields'].items() if k != 'ordering'})
        self.assertIn('ordering', data['kitchens'][0]['fields'])

    def test_conflict_missing_hours_bad_timezone_and_duplicate_mode_block(self):
        conflict = inventory()
        conflict['kitchens'][0]['fields']['services'] = m.encode([])
        unknown = hours()
        unknown['timezone'] = 'Unknown/Nowhere'
        cases = [
            conflict, inventory([policy(enabled=True)]),
            inventory([policy(service_hours={'operation_hours': unknown})]),
            inventory([policy(), policy()]),
        ]
        for data in cases:
            with self.subTest(data=data):
                plan = m.build_plan(data)
                self.assertTrue(plan['issues'])
                self.assertFalse(plan['changes'])

    def test_disabled_empty_custom_hours_can_be_absent(self):
        plan = m.build_plan(inventory([policy(service_hours={'inherit_kitchen_operation_hours': False, 'operation_hours': {'windows': []}})]))
        self.assertFalse(plan['issues'])
        self.assertNotIn('hours', services(plan)[0])

    def test_empty_custom_config_inherits_as_old_reader_did(self):
        data = inventory([policy(enabled=True, service_hours={'inherit_kitchen_operation_hours': False, 'operation_hours': {'windows': []}})], orders={'operation_hours': hours()})
        plan = m.build_plan(data)
        self.assertFalse(plan['issues'])
        self.assertEqual(services(plan)[0]['hours'], hours())

    def test_exact_rerun_and_browse_only_service(self):
        data = inventory()
        plan = m.build_plan(data)
        data['kitchens'][0]['fields'] = plan['changes'][0]['after']
        self.assertEqual(m.build_plan(data)['changes'], [])
        self.assertEqual(m.build_plan(data)['issues'], [])
        data['kitchens'][0]['fields']['services'] = m.encode([{'id': 'browse', 'name': 'Browse', 'enabled': True, 'menu_ids': [], 'interactions': [{'type': 'browse', 'enabled': True}]}])
        self.assertEqual(m.build_plan(data)['issues'], [])

    def test_named_duplicate_ids_block_and_outside_scope_refused(self):
        data = inventory()
        plan = m.build_plan(data)
        values = services(plan)
        data['kitchens'][0]['fields'] = {'services': m.encode(values + values)}
        self.assertTrue(m.build_plan(data)['issues'])
        with self.assertRaisesRegex(ValueError, 'same-id'):
            m.build_plan({**data, 'places': [doc('places/other', {})]})
        with self.assertRaisesRegex(ValueError, 'Exactly one'):
            m.build_plan({'kitchens': []})


class RunnerTests(unittest.TestCase):
    def test_exact_inventory_never_lists_or_reads_children(self):
        kitchen = inventory()['kitchens'][0]
        place = doc('places/k', {'timezone': 'Europe/Zurich', 'business_hours': hours()})
        calls = []
        def request(url):
            calls.append(url)
            return {f'{runner.BASE}/kitchens/k': kitchen, f'{runner.BASE}/places/k': place}[url]
        result = runner.read_inventory(request, 'k', m.needs_place)
        self.assertEqual(result, {'kitchens': [kitchen], 'places': [place]})
        self.assertEqual(len(calls), 2)
        for invalid in [None, '', '.', '..', 'k/child', 'k?mask=services', 'k#ignored']:
            with self.assertRaises(ValueError):
                runner.read_inventory(request, invalid, m.needs_place)
        custom = inventory([policy(service_hours={'operation_hours': hours()})])['kitchens'][0]
        calls.clear()
        runner.read_inventory(lambda url: calls.append(url) or custom, 'k', m.needs_place)
        self.assertEqual(len(calls), 1)

    def test_missing_place_is_captured_and_new_place_blocks_commit(self):
        kitchen = inventory()['kitchens'][0]
        def missing_request(url):
            if '/places/' in url:
                raise urllib.error.HTTPError(url, 404, 'missing', {}, None)
            return kitchen
        data = runner.read_inventory(missing_request, 'k', m.needs_place)
        self.assertEqual(data['places'], [{'name': f'{m.TARGET}/documents/places/k', 'missing': True}])
        plan = m.build_plan(data)
        calls = []
        def request(url, payload=None):
            calls.append(url)
            if url.endswith(':beginTransaction'):
                return {'transaction': 't'}
            if url.endswith(':rollback'):
                return {}
            return doc('places/k', {}) if '/places/' in url else kitchen
        with self.assertRaisesRegex(RuntimeError, 'appeared since review'):
            runner.apply_plan(request, plan)
        self.assertFalse(any(url.endswith(':commit') for url in calls))

    def test_cas_and_place_dependencies_are_in_atomic_transaction(self):
        data = inventory([policy(enabled=True)])
        data['places'] = [doc('places/k', {'timezone': 'Europe/Zurich', 'business_hours': hours()})]
        plan = m.build_plan(data)
        calls = []
        def request(url, payload=None):
            calls.append((url, payload))
            if url.endswith(':beginTransaction'):
                return {'transaction': 'transaction-token'}
            if url.endswith(':commit'):
                self.assertEqual(payload['transaction'], 'transaction-token')
                self.assertEqual(payload['writes'][0]['currentDocument'], {'updateTime': 'reviewed'})
                self.assertEqual(payload['writes'][0]['updateMask']['fieldPaths'], ['ordering', 'services'])
                self.assertEqual(len(payload['writes']), 1)
                return {}
            self.assertIn('?transaction=transaction-token', url)
            return data['places'][0] if '/places/' in url else data['kitchens'][0]
        self.assertEqual(runner.apply_plan(request, plan)['applied'], 1)
        self.assertTrue(calls[-1][0].endswith(':commit'))

    def test_changed_place_or_kitchen_prevents_commit(self):
        data = inventory([policy(enabled=True)])
        data['places'] = [doc('places/k', {'timezone': 'Europe/Zurich', 'business_hours': hours()})]
        plan = m.build_plan(data)
        for changed in ['places', 'kitchens']:
            current = deepcopy(data)
            current[changed][0]['updateTime'] = 'changed'
            calls = []
            def request(url, payload=None):
                calls.append(url)
                if url.endswith(':beginTransaction'):
                    return {'transaction': 't'}
                if url.endswith(':rollback'):
                    return {}
                return current['places'][0] if '/places/' in url else current['kitchens'][0]
            with self.assertRaisesRegex(RuntimeError, 'changed since review'):
                runner.apply_plan(request, plan)
            self.assertFalse(any(url.endswith(':commit') for url in calls))
            self.assertTrue(calls[-1].endswith(':rollback'))

    def test_exact_postimage_replay_skips_even_if_place_later_changes(self):
        plan = m.build_plan(inventory())
        def request(url, payload=None):
            if url.endswith(':beginTransaction'):
                return {'transaction': 't'}
            if url.endswith(':rollback'):
                return {}
            self.assertIn('/kitchens/k?', url)
            return {'fields': plan['changes'][0]['after']}
        self.assertEqual(runner.apply_plan(request, plan), {'applied': 0, 'already_applied': 1})

    def test_export_is_bound_to_new_prefix_and_dependency_scope(self):
        export = {'done': True, 'metadata': {'outputUriPrefix': runner.BACKUP, 'collectionIds': ['kitchens', 'places']}}
        operation = f'{m.TARGET}/operations/export'
        self.assertEqual(runner.require_completed_export(lambda _: export, operation, True), export)
        export['metadata']['collectionIds'] = ['kitchens']
        with self.assertRaisesRegex(RuntimeError, 'scope incomplete'):
            runner.require_completed_export(lambda _: export, operation, True)
        export['metadata']['outputUriPrefix'] = runner.BACKUP + '-other'
        with self.assertRaisesRegex(RuntimeError, 'destination differs'):
            runner.require_completed_export(lambda _: export, operation)


if __name__ == '__main__':
    unittest.main()
