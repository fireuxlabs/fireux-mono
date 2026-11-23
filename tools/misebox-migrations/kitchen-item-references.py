"""Prepare or execute the exact Misebox Item reference cutover.

Default mode writes a private dry-run plan. Production apply and rollback need
separately signed release approval and a completed managed export. See README.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import ssl
import subprocess
import tempfile
from urllib.error import HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

PRODUCTION = 'projects/misebox-78f9c/databases/misebox'
DEMO = 'projects/demo-misebox-item-references/databases/misebox'
GROUPS = {'kitchens', 'dishes', 'items', 'menus', 'sections', 'promotions'}
BACKUP_BUCKET = 'gs://misebox-78f9c-firestore-migrations/'
BATCH_SIZE = 50
MAX_BATCH_BYTES = 6 * 1024 * 1024
TRANSACTION_SETTLE_SECONDS = 275
ALLOWED_SIGNERS = Path.home() / '.config/fireux/misebox-release-allowed-signers'


def now():
    return datetime.now(timezone.utc)


def timestamp(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def item_id(value):
    result = value.get('stringValue') if isinstance(value, dict) else None
    require(isinstance(result, str) and result and result == result.strip()
            and '/' not in result and result not in ('.', '..')
            and not re.fullmatch(r'__.*__', result)
            and len(result.encode()) <= 1500, 'Invalid stored reference id')
    return result


def path_kind(path):
    parts = path.split('/')
    require(parts[0] == 'kitchens' and all(parts), f'Invalid scope: {path}')
    if len(parts) == 4 and parts[2] in ('dishes', 'items', 'promotions'):
        return parts[2]
    if len(parts) == 8 and parts[2:7:2] == ['menus', 'sections', 'items']:
        return 'placement'
    raise ValueError(f'Unexpected path: {path}')


def choice_fields(fields, legacy='dishId'):
    require('itemId' not in fields and not (legacy in fields and 'item_id' in fields),
            'Mixed or noncanonical reference fields')
    if legacy not in fields:
        item_id(fields.get('item_id'))
        return fields
    item_id(fields[legacy])
    return {**{k: v for k, v in fields.items() if k != legacy}, 'item_id': fields[legacy]}


def migrate_choices(container):
    array = container['arrayValue']
    choices = []
    for choice in array.get('values', []):
        body = choice['mapValue']
        choices.append({**choice, 'mapValue': {**body, 'fields': choice_fields(body['fields'])}})
    return {**container, 'arrayValue': {**array, 'values': choices}}


def promotion_fields(fields):
    require(('dishes' in fields) != ('groups' in fields), 'Unsupported Promotion reference shape')
    if 'dishes' in fields:
        return {**fields, 'dishes': migrate_choices(fields['dishes'])}
    container = fields['groups']
    array = container['arrayValue']
    groups = []
    for group in array.get('values', []):
        body = group['mapValue']
        values = body['fields']
        groups.append({**group, 'mapValue': {**body, 'fields': {
            **values, 'dishes': migrate_choices(values['dishes'])
        }}})
    return {**fields, 'groups': {**container, 'arrayValue': {**array, 'values': groups}}}


def promotion_choices(fields):
    lists = [fields['dishes']] if 'dishes' in fields else [
        row['mapValue']['fields']['dishes']
        for row in fields['groups']['arrayValue'].get('values', [])
    ]
    return [row['mapValue']['fields']
            for rows in lists for row in rows['arrayValue'].get('values', [])]


def build_actions(records):
    copies, references = [], []
    for path, record in sorted(records.items()):
        require(bool(record.get('updateTime')) and isinstance(record.get('fields'), dict),
                f'Missing version or fields: {path}')
        kind = path_kind(path)
        before = record['fields']
        if kind == 'dishes':
            parent, doc_id = path.rsplit('/dishes/', 1)
            destination = f'{parent}/items/{doc_id}'
            if destination in records:
                require(records[destination]['fields'] == before,
                        f'Conflicting catalogue destination: {destination}')
            else:
                copies.append({'path': destination, 'source': path, 'after': before})
        elif kind == 'placement':
            if 'promotion_id' in before:
                require(not {'dish_id', 'dishId', 'item_id', 'itemId'}.intersection(before),
                        f'Mixed placement: {path}')
                promotion = item_id(before['promotion_id'])
                require(f'{path.split("/menus/")[0]}/promotions/{promotion}' in records,
                        f'Missing Promotion: {path}')
                continue
            after = choice_fields(before, 'dish_id')
            require('dishId' not in before, f'Unexpected placement reference: {path}')
            if after != before:
                references.append({'path': path, 'after': after})
        elif kind == 'promotions':
            after = promotion_fields(before)
            if after != before:
                references.append({'path': path, 'after': after})
    expected = {**{p: d['fields'] for p, d in records.items()},
                **{a['path']: a['after'] for a in copies + references}}
    for path, fields in expected.items():
        kind = path_kind(path)
        if kind == 'placement' and 'item_id' in fields:
            ids = [item_id(fields['item_id'])]
        elif kind == 'promotions':
            ids = [item_id(choice['item_id']) for choice in promotion_choices(fields)]
        else:
            continue
        parent = '/'.join(path.split('/')[:2])
        for ref in ids:
            require(f'{parent}/items/{ref}' in expected, f'Unresolved Item reference: {path}')
    return copies + references


class Firestore:
    def __init__(self, emulator):
        self.target = DEMO if emulator else PRODUCTION
        if emulator:
            require(re.fullmatch(r'127\.0\.0\.1:[0-9]{1,5}', emulator),
                    'Only the explicit loopback emulator is supported')
        self.origin = f'http://{emulator}' if emulator else 'https://firestore.googleapis.com'
        self.token = 'owner' if emulator else subprocess.check_output(
            ['gcloud', 'auth', 'print-access-token'], text=True).strip()
        self.context = ssl.create_default_context() if not emulator else None

    def request(self, suffix, data=None):
        request = Request(f'{self.origin}/v1/{suffix}',
                          data=None if data is None else json.dumps(data).encode(),
                          headers={'Authorization': 'Bearer ' + self.token,
                                   'Content-Type': 'application/json'})
        with urlopen(request, timeout=45, context=self.context) as response:
            return json.load(response)

    def name(self, path):
        return f'{self.target}/documents/{path}'

    def listing(self, collection, read_time, show_missing=False):
        params = {'pageSize': 250}
        if self.target == PRODUCTION:
            params['readTime'] = read_time
        if show_missing:
            params['showMissing'] = 'true'
        while True:
            result = self.request(self.name(quote(collection, safe='/')) + '?' + urlencode(params))
            yield from result.get('documents', [])
            if not result.get('nextPageToken'):
                return
            params['pageToken'] = result['nextPageToken']

    def read_time(self):
        if self.target == DEMO:
            # The emulator's missing-document BatchGet hits an epoch placeholder.
            return now().isoformat(timespec='microseconds').replace('+00:00', 'Z')
        result = self.request(self.name('')[:-1] + ':batchGet', {
            'documents': [self.name('kitchens/fireux-item-migration-time-probe')],
        })
        return result[0]['readTime']

    def inventory(self):
        # Use the database clock for one consistent snapshot of the hierarchy.
        read_time = self.read_time()
        def scan(root):
            kitchen = root['name'].removeprefix(self.name(''))
            rows = [row for group in ('dishes', 'items', 'promotions')
                    for row in self.listing(f'{kitchen}/{group}', read_time)]
            for menu in self.listing(f'{kitchen}/menus', read_time, show_missing=True):
                menu_path = menu['name'].removeprefix(self.name(''))
                for section in self.listing(f'{menu_path}/sections', read_time, show_missing=True):
                    section_path = section['name'].removeprefix(self.name(''))
                    placements = list(self.listing(f'{section_path}/items', read_time))
                    require(not placements or all('updateTime' in d for d in (root, menu, section)),
                            f'Orphaned placements: {section_path}')
                    rows.extend(placements)
            require('updateTime' in root or not rows, f'Orphaned Kitchen catalogue: {kitchen}')
            return {row['name'].removeprefix(self.name('')): {
                'fields': row.get('fields', {}), 'updateTime': row['updateTime']
            } for row in rows}
        records = {}
        with ThreadPoolExecutor(max_workers=5) as pool:
            for rows in pool.map(scan, self.listing('kitchens', read_time, show_missing=True)):
                records.update(rows)
        return read_time, records

    def read(self, paths, transaction=None):
        if not paths:
            return {}
        result = self.request(self.name('')[:-1] + ':batchGet', {
            'documents': [self.name(p) for p in paths],
            **({'transaction': transaction} if transaction else {}),
        })
        rows = {}
        for row in result:
            if 'found' in row:
                fields = row['found']
                rows[fields['name'].removeprefix(self.name(''))] = {
                    'fields': fields.get('fields', {}), 'updateTime': fields['updateTime']}
            else:
                rows[row['missing'].removeprefix(self.name(''))] = None
        require(set(rows) == set(paths), 'Incomplete batch read')
        return rows

    def commit(self, writes, reads, prepare=None):
        endpoint = self.name('')[:-1]
        tx = self.request(endpoint + ':beginTransaction', {'options': {'readWrite': {}}})['transaction']
        try:
            require(self.read(sorted(reads), tx) == reads, 'Version conflict inside transaction')
            if prepare:
                prepare(self.read_time())
            return self.request(endpoint + ':commit', {'transaction': tx, 'writes': writes})
        except Exception:
            try:
                self.request(endpoint + ':rollback', {'transaction': tx})
            except (OSError, ValueError):
                pass
            raise


def save(path, value):
    # A fsynced, atomically replaced private journal survives interrupted commits.
    with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, delete=False) as file:
        try:
            json.dump(value, file, sort_keys=True, separators=(',', ':'))
            file.flush()
            os.fsync(file.fileno())
            os.replace(file.name, path)
            fd = os.open(path.parent, os.O_RDONLY)
            try:
                os.fsync(fd)
            finally:
                os.close(fd)
        finally:
            Path(file.name).unlink(missing_ok=True)


def load(path):
    require(not path.is_symlink() and path.stat().st_mode & 0o077 == 0,
            'Operational files must be private regular files')
    require(path.is_file(), 'Expected a regular operational file')
    return json.loads(path.read_text())


def batches(actions):
    batch, size = [], 0
    for action in actions:
        weight = len(json.dumps(action['after']).encode()) + len(action['path'].encode()) + 512
        require(weight <= MAX_BATCH_BYTES, 'Document exceeds rehearsal batch byte budget')
        if len(batch) >= BATCH_SIZE or size + weight > MAX_BATCH_BYTES:
            yield batch
            batch, size = [], 0
        batch.append(action)
        size += weight
    if batch:
        yield batch


def write_for(db, path, actual, fields):
    precondition = {'updateTime': actual['updateTime']} if actual else {'exists': False}
    body = {'delete': db.name(path)} if fields is None else {
        'update': {'name': db.name(path), 'fields': fields}}
    return {**body, 'currentDocument': precondition}


def check_export(db, name):
    require(re.fullmatch(re.escape(PRODUCTION) + r'/operations/[A-Za-z0-9_-]+', name),
            'Exact database export operation required')
    operation = db.request(name)
    metadata = operation.get('metadata', {})
    output = operation.get('response', {})
    require(operation.get('name') == name and operation.get('done') is True and not operation.get('error')
            and metadata.get('@type', '').endswith('.ExportDocumentsMetadata')
            and output.get('@type', '').endswith('.ExportDocumentsResponse')
            and output.get('outputUriPrefix', '').startswith(BACKUP_BUCKET)
            and (not metadata.get('collectionIds') or GROUPS.issubset(metadata['collectionIds'])),
            'Completed managed export with all affected collection groups required')
    require(bool(metadata.get('endTime')), 'Export completion time is required')
    return operation


def authorize(args, db, plan, plan_hash):
    require(args.confirm == plan_hash, 'Exact reviewed plan hash required')
    if db.target == DEMO:
        return
    require(args.authorization and args.signature,
            'Separate signed production release authorization required')
    path = Path(args.authorization)
    require(not path.is_symlink() and path.is_file() and path.stat().st_mode & 0o077 == 0,
            'Release authorization must be a private regular file')
    signed_content = path.read_bytes()
    approval = json.loads(signed_content)
    verify = subprocess.run([
        'ssh-keygen', '-Y', 'verify', '-f', str(ALLOWED_SIGNERS), '-I', 'misebox-release',
        '-n', 'fireux-item-references', '-s', args.signature,
    ], input=signed_content, capture_output=True)
    require(verify.returncode == 0, 'Production release signature rejected')
    require(approval.get('target') == PRODUCTION and approval.get('plan') == plan_hash
            and approval.get('action') == args.mode and approval.get('writersPaused') is True,
            'Authorization must bind exact target, plan, action and paused writers')
    require(timestamp(approval['pausedAt']) <= timestamp(plan['readTime']) <= now()
            < timestamp(approval['expiresAt']), 'Approved maintenance window is invalid or expired')
    export = check_export(db, approval.get('exportOperation', ''))
    require(timestamp(export['metadata']['endTime']) >= timestamp(approval['pausedAt']),
            'Managed export must complete after writers are paused')
    save(Path(args.directory) / 'managed-export.json', export)
    return timestamp(approval['expiresAt'])


def run_changes(db, mode, plan, actions, journal_path, expires=None):
    plan_hash = digest(plan)
    journal = load(journal_path) if journal_path.exists() else {
        'plan': plan_hash, 'versions': {}, 'restored': {}, 'pending': None}
    require(journal['plan'] == plan_hash, 'Journal belongs to a different plan')
    original = plan['records']
    by_path = {a['path']: a for a in actions}

    def expected(path):
        if path in journal['restored']:
            version = journal['restored'][path]
            return {'fields': original[path]['fields'], 'updateTime': version} if version else None
        if path in journal['versions']:
            return {'fields': by_path[path]['after'], 'updateTime': journal['versions'][path]}
        return original.get(path)

    def settle(pending, current, receipt=None):
        names = pending['paths']
        fields = {p: (by_path[p]['after'] if pending['mode'] == 'apply'
                      else original.get(p, {}).get('fields')) for p in names}
        if receipt is None and all(current[p] == expected(p) for p in names):
            age = timestamp(db.read_time()) - timestamp(pending['at'])
            require(age.total_seconds() >= TRANSACTION_SETTLE_SECONDS,
                    'Pending commit may still be in flight. Keep writers paused and retry after it expires.')
            return
        require(all((v is None and current[p] is None)
                    or (v is not None and current[p] and current[p]['fields'] == v)
                    for p, v in fields.items()), 'Pending batch has mixed or unexpected postimages')
        versions = {current[p]['updateTime'] for p in names if current[p]}
        if receipt is not None:
            results = receipt['writeResults']
            require(len(results) == len(names) and all(
                value is None or current[p]['updateTime'] == result.get('updateTime')
                for (p, value), result in zip(fields.items(), results)
            ), 'Write readback version differs from commit receipt')
        else:
            require(len(versions) <= 1 and all(timestamp(v) >= timestamp(pending['at']) for v in versions),
                    'Cannot attribute pending postimages to one commit during the writer pause')
        key = 'versions' if pending['mode'] == 'apply' else 'restored'
        journal[key].update({p: current[p]['updateTime'] if current[p] else None for p in names})

    if journal['pending']:
        require(mode != 'verify', 'Resolve the pending batch with the authorized apply or rollback before verification')
        pending = journal['pending']
        settle(pending, db.read(pending['paths']))
        journal['pending'] = None
        save(journal_path, journal)

    # Check complete scope before the first write on every invocation. This also
    # detects fresh documents added since review and changed identical destinations.
    _, observed = db.inventory()
    wanted = {p: expected(p) for p in original.keys() | by_path.keys() if expected(p) is not None}
    require(observed == wanted, 'Inventory or document versions changed since review')
    if mode == 'verify':
        require(len(journal['versions']) == len(actions) and not journal['restored'],
                'Migration is not fully applied')
        require(not build_actions(observed), 'Legacy references or missing catalogue copies remain')
        return {'verified': len(actions)}
    if mode == 'apply':
        require(not journal['restored'], 'Rollback has started; prepare a new plan before applying again')
        remaining = [a for a in actions if a['path'] not in journal['versions']]
    else:
        remaining = [a for a in reversed(actions)
                     if a['path'] in journal['versions'] and a['path'] not in journal['restored']]
    for batch in batches(remaining):
        require(expires is None or now() < expires, 'Production authorization expired')
        paths = [a['path'] for a in batch]
        reads = {p: expected(p) for p in paths}
        reads.update({a['source']: expected(a['source']) for a in batch if 'source' in a})
        writes = [write_for(db, a['path'], reads[a['path']],
                            a['after'] if mode == 'apply' else original.get(a['path'], {}).get('fields'))
                  for a in batch]
        pending = {'paths': paths, 'mode': mode}

        def prepare(at):
            require(expires is None or timestamp(at) < expires, 'Production authorization expired')
            pending['at'] = at
            journal['pending'] = pending
            save(journal_path, journal)

        receipt = db.commit(writes, reads, prepare)
        settle(pending, db.read(paths), receipt)
        journal['pending'] = None
        save(journal_path, journal)
    final = db.read(sorted(by_path)) if len(by_path) <= BATCH_SIZE else {
        p: row for batch in batches(actions) for p, row in db.read([a['path'] for a in batch]).items()}
    require(all(row == expected(p) for p, row in final.items()), 'Final version verification failed')
    return {'applied': len(journal['versions']), 'rolledBack': len(journal['restored']),
            'writtenThisRun': len(remaining)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['plan', 'apply', 'verify', 'rollback'], nargs='?', default='plan')
    parser.add_argument('--directory', required=True)
    parser.add_argument('--emulator')
    parser.add_argument('--confirm')
    parser.add_argument('--authorization')
    parser.add_argument('--signature')
    args = parser.parse_args()
    os.umask(0o077)
    directory = Path(args.directory).resolve()
    require(not directory.is_relative_to(Path(__file__).resolve().parents[2]),
            'Plans and journals must be outside the repo')
    directory.mkdir(mode=0o700, exist_ok=True)
    require(directory.stat().st_mode & 0o077 == 0 and directory.stat().st_uid == os.getuid(),
            'Use a private directory owned by the operator')
    if args.mode in ('apply', 'rollback') and not args.emulator:
        require(args.confirm and args.authorization and args.signature,
                'Separate signed production release authorization required')
    with (directory / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        db = Firestore(args.emulator)
        source_hash = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        plan_path = directory / 'plan.json'
        if args.mode == 'plan':
            require(not plan_path.exists(), 'Use a fresh directory for each reviewed plan')
            read_time, records = db.inventory()
            actions = build_actions(records)
            plan = {'target': db.target, 'source': source_hash, 'readTime': read_time, 'records': records}
            save(plan_path, plan)
            print(json.dumps({'target': db.target, 'planHash': digest(plan), 'readTime': read_time,
                              'copies': sum('source' in action for action in actions),
                              'placements': sum(path_kind(a['path']) == 'placement' for a in actions),
                              'promotionDocuments': sum(path_kind(a['path']) == 'promotions' for a in actions),
                              'promotionReferences': sum(
                                  'dishId' in choice
                                  for path, record in records.items() if path_kind(path) == 'promotions'
                                  for choice in promotion_choices(record['fields'])
                              ),
                              'batches': sum(1 for _ in batches(actions))}))
            return
        plan = load(plan_path)
        require(plan['target'] == db.target and plan['source'] == source_hash,
                'Firestore target or reviewed tool source changed')
        actions = build_actions(plan['records'])
        expires = authorize(args, db, plan, digest(plan)) if args.mode != 'verify' else None
        print(json.dumps(run_changes(db, args.mode, plan, actions, directory / 'journal.json', expires)))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        if isinstance(error, HTTPError):
            raise SystemExit(f'Firestore HTTP {error.code}; retain the plan and journal.') from None
        raise SystemExit(str(error)) from None
