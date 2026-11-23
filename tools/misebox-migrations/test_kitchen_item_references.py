import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

SOURCE = Path(__file__).with_name('kitchen-item-references.py')
SPEC = importlib.util.spec_from_file_location('kitchen_item_references', SOURCE)
tool = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(tool)


def string(value):
    return {'stringValue': value}


def array(*rows):
    return {'arrayValue': {'values': [{'mapValue': {'fields': row}} for row in rows]}}


def document(fields):
    return {'updateTime': '2026-11-23T18:00:00Z', 'fields': fields}


class Planning(unittest.TestCase):
    def test_preserves_typed_fields_and_independent_ids(self):
        source = {'name': string('Pizza'), 'price': {'doubleValue': 18.0},
                  'updated': {'timestampValue': '2026-11-23T18:00:00.000001Z'}}
        placement = 'kitchens/k/menus/m/sections/s/items/placement'
        order = {'integerValue': '9007199254740993'}
        promotion = 'kitchens/k/promotions/deal'
        records = {
            'kitchens/k/dishes/pizza': document(source),
            placement: document({'dish_id': string('pizza'), 'sort_order': order}),
            promotion: document({'groups': array({'dishes': array({
                'dishId': string('pizza'), 'supplement': {'doubleValue': 1.25}
            })})}),
        }
        actions = tool.build_actions(records)
        self.assertEqual(actions[0], {
            'path': 'kitchens/k/items/pizza', 'source': 'kitchens/k/dishes/pizza', 'after': source})
        by_path = {a['path']: a['after'] for a in actions}
        self.assertEqual(by_path[placement], {'item_id': string('pizza'), 'sort_order': order})
        self.assertEqual(by_path[promotion], {'groups': array({'dishes': array({
            'item_id': string('pizza'), 'supplement': {'doubleValue': 1.25}
        })})})
        self.assertIn('dish_id', records[placement]['fields'])

    def test_refuses_conflicting_destinations_mixed_fields_and_foreign_refs(self):
        source = 'kitchens/k/dishes/pizza'
        target = 'kitchens/k/items/pizza'
        placement = 'kitchens/other/menus/m/sections/s/items/placement'
        with self.assertRaisesRegex(ValueError, 'Conflicting catalogue'):
            tool.build_actions({source: document({}), target: document({'name': string('Other')})})
        with self.assertRaisesRegex(ValueError, 'Unresolved Item'):
            tool.build_actions({source: document({}), placement: document({'dish_id': string('pizza')})})
        with self.assertRaisesRegex(ValueError, 'Mixed'):
            tool.build_actions({placement: document({'dish_id': string('pizza'), 'item_id': string('pizza')})})
        with self.assertRaisesRegex(ValueError, 'Unexpected path'):
            tool.build_actions({'kitchens/k/orders/old': document({})})

    def test_production_gate_refuses_before_opening_firestore(self):
        with tempfile.TemporaryDirectory() as directory:
            for mode in ('apply', 'rollback'):
                result = subprocess.run([sys.executable, SOURCE, mode, '--directory', directory],
                                        text=True, capture_output=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('Separate signed production release authorization', result.stderr)
                self.assertEqual(list(Path(directory).iterdir()), [])

    def test_requested_confirmation_binds_exact_plan(self):
        args = SimpleNamespace(confirm='other')
        with self.assertRaisesRegex(ValueError, 'Exact reviewed plan'):
            tool.authorize(args, SimpleNamespace(target=tool.DEMO), {}, 'plan')

    def test_pending_commit_is_not_assumed_absent_while_it_can_still_land(self):
        path = 'kitchens/k/dishes/pizza'
        destination = 'kitchens/k/items/pizza'
        records = {path: document({'name': string('Pizza')})}
        plan = {'records': records}
        db = SimpleNamespace(read=lambda paths: {destination: None},
                             read_time=lambda: '2026-11-23T18:00:05Z')
        with tempfile.TemporaryDirectory() as directory:
            journal = Path(directory) / 'journal.json'
            pending = {'paths': [destination], 'mode': 'apply', 'at': '2026-11-23T18:00:00Z'}
            tool.save(journal, {'plan': tool.digest(plan), 'versions': {}, 'restored': {}, 'pending': pending})
            with self.assertRaisesRegex(ValueError, 'still be in flight'):
                tool.run_changes(db, 'rollback', plan, tool.build_actions(records), journal)
            self.assertEqual(tool.load(journal)['pending'], pending)

    def test_signed_authorization_binds_action_target_plan_and_backup(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            key = root / 'key'
            subprocess.run(['ssh-keygen', '-q', '-t', 'ed25519', '-N', '', '-f', key], check=True)
            signers = root / 'allowed-signers'
            signers.write_text('misebox-release ' + key.with_suffix('.pub').read_text())
            ticket = root / 'authorization.json'
            payload = {
                'target': tool.PRODUCTION, 'plan': 'exact-plan', 'action': 'apply',
                'writersPaused': True, 'pausedAt': '2026-11-23T18:00:00Z',
                'expiresAt': '2026-11-23T19:00:00Z',
                'exportOperation': tool.PRODUCTION + '/operations/test-export',
            }
            ticket.write_text(json.dumps(payload))
            ticket.chmod(0o600)
            subprocess.run(['ssh-keygen', '-Y', 'sign', '-f', key, '-n',
                            'fireux-item-references', ticket], capture_output=True, check=True)
            args = SimpleNamespace(mode='apply', confirm='exact-plan', directory=directory,
                                   authorization=str(ticket), signature=str(ticket) + '.sig')
            expected_export = {
                'name': payload['exportOperation'], 'done': True,
                'metadata': {'@type': 'type.googleapis.com/google.firestore.admin.v1.ExportDocumentsMetadata',
                             'collectionIds': sorted(tool.GROUPS), 'endTime': '2026-11-23T18:15:00Z'},
                'response': {'@type': 'type.googleapis.com/google.firestore.admin.v1.ExportDocumentsResponse',
                             'outputUriPrefix': tool.BACKUP_BUCKET + 'fixture'},
            }
            db = SimpleNamespace(target=tool.PRODUCTION, request=mock.Mock(return_value=expected_export))
            plan = {'readTime': '2026-11-23T18:30:00Z'}
            with mock.patch.object(tool, 'ALLOWED_SIGNERS', signers), mock.patch.object(
                tool, 'now', return_value=tool.timestamp('2026-11-23T18:45:00Z')
            ):
                self.assertEqual(tool.authorize(args, db, plan, 'exact-plan'),
                                 tool.timestamp(payload['expiresAt']))
                self.assertEqual(tool.load(root / 'managed-export.json'), expected_export)
                args.mode = 'rollback'
                with self.assertRaisesRegex(ValueError, 'bind exact target'):
                    tool.authorize(args, db, plan, 'exact-plan')
                args.mode = 'apply'
                ticket.write_text(json.dumps({**payload, 'writersPaused': False}))
                with self.assertRaisesRegex(ValueError, 'signature rejected'):
                    tool.authorize(args, db, plan, 'exact-plan')


@unittest.skipUnless(os.getenv('FIREUX_ITEM_REHEARSAL_EMULATOR'), 'Requires isolated named emulator')
class NamedDatabase(unittest.TestCase):
    def test_cutover_recovery_and_rollback_at_audited_scale(self):
        db = tool.Firestore(os.environ['FIREUX_ITEM_REHEARSAL_EMULATOR'])
        self.assertEqual(db.target, tool.DEMO)
        root = 'kitchens/stage-two-scale'
        rows = {root: {'name': string('Fixture')}}
        for number in range(555):
            fields = {'name': string(f'Item {number}'), 'price': {'integerValue': str(number)},
                      'created': {'timestampValue': '2026-11-23T19:00:00.042001Z'}}
            rows[f'{root}/dishes/item-{number}'] = fields
            if number < 35:
                rows[f'{root}/items/item-{number}'] = fields
        for menu in ('food', 'evening'):
            rows[f'{root}/menus/{menu}'] = {'status': string('published')}
            rows[f'{root}/menus/{menu}/sections/pizza'] = {'label': string('Pizza')}
        for number in range(991):
            menu = ('food', 'evening')[number % 2]
            rows[f'{root}/menus/{menu}/sections/pizza/items/entry-{number}'] = {
                'dish_id': string(f'item-{number % 555}'),
                'sort_order': {'integerValue': str(number)},
                'status': string('archived' if number == 0 else 'active'),
            }
        rows[f'{root}/promotions/offer'] = {'status': string('paused'), 'dishes': array(*[
            {'dishId': string(f'item-{number}'), 'price': {'integerValue': '10'}}
            for number in range(17)
        ])}
        rows[f'{root}/promotions/deal'] = {'groups': array({'dishes': array(
            {'dishId': string('item-34'), 'supplement': {'integerValue': '0'}},
            {'dishId': string('item-35'), 'supplement': {'integerValue': '1'}},
        )})}
        history = {f'{root}/{name}/original': {'dish_id': string('unknown-historical-id')}
                   for name in ('orders', 'sales', 'submitted-orders', 'financial-facts')}
        rows.update(history)
        all_rows = list(rows.items())
        for offset in range(0, len(all_rows), 100):
            db.request(db.name('')[:-1] + ':commit', {'writes': [
                tool.write_for(db, path, None, fields) for path, fields in all_rows[offset:offset + 100]
            ]})
        historical = db.read(history)
        read_time, records = db.inventory()
        actions = tool.build_actions(records)
        self.assertEqual(len(actions), 520 + 991 + 2)
        self.assertEqual(sum('source' in action for action in actions), 520)
        source = f'{root}/dishes/item-35'

        def run(mode, journal):
            return tool.run_changes(db, mode, plan, actions, journal)

        def replace(path, fields):
            current = db.read([path])
            db.commit([tool.write_for(db, path, current[path], fields)], current)

        with tempfile.TemporaryDirectory() as temp:
            journal = Path(temp) / 'journal.json'
            plan = {'target': db.target, 'readTime': read_time, 'records': records}
            replace(source, {'name': string('Changed between plan and apply')})
            with self.assertRaisesRegex(ValueError, 'Inventory or document versions changed'):
                run('apply', journal)
            self.assertFalse(journal.exists())
            self.assertIsNone(db.read([f'{root}/items/item-35'])[f'{root}/items/item-35'])
            replace(source, rows[source])
            plan['readTime'], plan['records'] = db.inventory()
            commit = db.commit
            count = 0

            def lose_reply(writes, reads, prepare):
                nonlocal count
                count += 1
                result = commit(writes, reads, prepare)
                if count == 3:
                    raise OSError('Simulated interruption after commit')
                return result

            db.commit = lose_reply
            with self.assertRaisesRegex(OSError, 'Simulated interruption'):
                run('apply', journal)
            db.commit = commit
            self.assertIsNotNone(tool.load(journal)['pending'])
            self.assertEqual(len(tool.load(journal)['versions']), 100)
            self.assertEqual(run('apply', journal)['writtenThisRun'], len(actions) - 150)
            self.assertEqual(run('apply', journal)['writtenThisRun'], 0)
            self.assertEqual(run('verify', journal), {'verified': len(actions)})
            self.assertEqual(db.read(history), historical)
            self.assertEqual(run('rollback', journal)['writtenThisRun'], len(actions))
            self.assertEqual(run('rollback', journal)['writtenThisRun'], 0)
            _, restored = db.inventory()
            self.assertEqual({p: d['fields'] for p, d in restored.items()},
                             {p: d['fields'] for p, d in plan['records'].items()})
            self.assertEqual(db.read(history), historical)

            # A fresh plan can apply again after rollback. Even an identical
            # later payload has a different version and must block rollback.
            journal = Path(temp) / 'second-journal.json'
            plan['readTime'], plan['records'] = db.inventory()
            self.assertEqual(run('apply', journal)['writtenThisRun'], len(actions))
            target = f'{root}/items/item-35'
            original_target = db.read([target])[target]['fields']
            replace(target, {'name': string('Subsequent authorized write')})
            replace(target, original_target)
            with self.assertRaisesRegex(ValueError, 'Inventory or document versions changed'):
                run('rollback', journal)
            self.assertEqual(db.read([target])[target]['fields'], original_target)
            self.assertEqual(db.read(history), historical)
