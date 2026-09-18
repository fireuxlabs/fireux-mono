"""Exact Kitchen named-services runner; reuses the established guarded writer."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request

import kitchen_ordering_runner as guarded
from kitchen_ordering_runner import BASE, TARGET, digest, verify_plan

BACKUP = 'gs://misebox-78f9c-firestore-migrations/named-services-20260918'


def validate_id(kitchen_id):
    if not isinstance(kitchen_id, str) or not re.fullmatch(r'[A-Za-z0-9_-]+', kitchen_id):
        raise ValueError('Kitchen id must be one explicit document id')


def read_inventory(request, kitchen_id, needs_place):
    validate_id(kitchen_id)
    kitchen = request(f'{BASE}/kitchens/{urllib.parse.quote(kitchen_id, safe="")}')
    if kitchen.get('name') != f'{TARGET}/documents/kitchens/{kitchen_id}':
        raise RuntimeError('Kitchen differs from requested scope')
    inventory = {'kitchens': [kitchen], 'places': []}
    try:
        required = needs_place(kitchen)
    except (ValueError, TypeError, KeyError, AttributeError):
        # The pure planner reports malformed policies; never expand scope for them.
        required = False
    if required:
        try:
            place = request(f'{BASE}/places/{urllib.parse.quote(kitchen_id, safe="")}')
        except urllib.error.HTTPError as error:
            if error.code != 404:
                raise
            inventory['places'].append({'name': f'{TARGET}/documents/places/{kitchen_id}', 'missing': True})
        else:
            if place.get('name') != f'{TARGET}/documents/places/{kitchen_id}':
                raise RuntimeError('Place differs from exact same-id relationship')
            inventory['places'].append(place)
    return inventory


def require_completed_export(request, operation, has_places=False):
    if not operation or not operation.startswith(f'{TARGET}/operations/'):
        raise RuntimeError('Exact-target managed export operation required')
    export = request(f'https://firestore.googleapis.com/v1/{operation}')
    if not export.get('done') or export.get('error'):
        raise RuntimeError('Managed export is not successfully complete')
    metadata = export.get('metadata', {})
    if metadata.get('outputUriPrefix', '').rstrip('/') != BACKUP:
        raise RuntimeError('Backup destination differs from reviewed destination')
    required = {'kitchens', 'places'} if has_places else {'kitchens'}
    if not required.issubset(metadata.get('collectionIds', [])):
        raise RuntimeError('Backup scope incomplete')
    return export


def validate_plan(plan):
    validate_id(plan.get('kitchen_id'))
    if plan.get('target') != TARGET:
        raise RuntimeError('Unexpected target')
    kitchen_name = f"{TARGET}/documents/kitchens/{plan['kitchen_id']}"
    if len(plan['changes']) > 1:
        raise RuntimeError('Only one Kitchen root may change')
    for change in plan['changes']:
        if change['name'] != kitchen_name or change['changed'] != ['ordering', 'services']:
            raise RuntimeError('Unexpected mutation scope')
        preserved = {k: v for k, v in change['before'].items() if k != 'ordering'}
        expected = {**preserved, 'services': change['after'].get('services')}
        if change['after'] != expected or 'ordering' not in change['before'] or 'services' in change['before']:
            raise RuntimeError('Only old ordering may be replaced by named services')
    if len(plan.get('dependencies', [])) > 1:
        raise RuntimeError('Unexpected dependency scope')
    for dependency in plan.get('dependencies', []):
        if dependency['name'] != f"{TARGET}/documents/places/{plan['kitchen_id']}":
            raise RuntimeError('Unexpected Place dependency')


def apply_plan(request, plan):
    validate_plan(plan)
    if plan['issues']:
        raise RuntimeError('Resolve migration issues before applying')
    if not plan['changes']:
        return {'applied': 0, 'already_applied': 0}
    # Snapshot all reads in the same transaction. A concurrent Place edit then
    # conflicts with commit, even though Place is never written by this migration.
    transaction = request(f'{BASE}:beginTransaction', {})['transaction']
    committed = False

    def transactional_request(url, data=None):
        nonlocal committed
        if data is None:
            separator = '&' if '?' in url else '?'
            return request(url + separator + urllib.parse.urlencode({'transaction': transaction}))
        result = request(url, {**data, 'transaction': transaction})
        committed = True
        return result

    try:
        change = plan['changes'][0]
        current = transactional_request(f"https://firestore.googleapis.com/v1/{change['name']}")
        if current.get('fields', {}) == change['after']:
            return {'applied': 0, 'already_applied': 1}
        for dependency in plan.get('dependencies', []):
            try:
                actual = transactional_request(f"https://firestore.googleapis.com/v1/{dependency['name']}")
            except urllib.error.HTTPError as error:
                if error.code == 404 and dependency.get('missing'):
                    continue
                raise
            if dependency.get('missing'):
                raise RuntimeError('Place appeared since review; replan')
            if actual.get('updateTime') != dependency['updateTime'] or actual.get('fields', {}) != dependency.get('fields', {}):
                raise RuntimeError('Place hours changed since review; replan')
        # Existing bounded writer checks the exact preimage/updateTime, builds the
        # update mask, and commits atomically. Its postimage reader is also reused.
        return guarded.apply_plan(transactional_request, plan)
    finally:
        if not committed:
            request(f'{BASE}:rollback', {'transaction': transaction})


def run(build_plan, needs_place, source_files):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['plan', 'apply', 'verify'])
    parser.add_argument('--directory', required=True)
    parser.add_argument('--kitchen-id', help='Required in plan mode; exactly one Kitchen')
    parser.add_argument('--confirm')
    parser.add_argument('--export-operation')
    args = parser.parse_args()
    if args.mode == 'plan' and not args.kitchen_id:
        parser.error('plan requires --kitchen-id; all-Kitchen planning is unavailable')
    if args.mode != 'plan' and args.kitchen_id is not None:
        parser.error('apply/verify use the exact Kitchen saved in the reviewed plan')
    if args.kitchen_id:
        validate_id(args.kitchen_id)
    os.umask(0o077)
    directory = Path(args.directory)
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    if directory.is_symlink() or directory.stat().st_mode & 0o077:
        raise RuntimeError('Plan directory must be private (mode 0700) and not a symlink')
    token = subprocess.check_output(['gcloud', 'auth', 'print-access-token'], text=True).strip()

    def request(url, data=None):
        req = urllib.request.Request(url, data=None if data is None else json.dumps(data).encode(), headers={
            'Authorization': f'Bearer {token}', 'Content-Type': 'application/json',
        })
        with urllib.request.urlopen(req) as response:
            return json.load(response)

    source_hash = digest([Path(path).read_text() for path in source_files])
    plan_path = directory / 'plan.json'
    if args.mode == 'plan':
        if any(directory.iterdir()):
            raise RuntimeError('Use a fresh empty directory to preserve existing preimages')
        inventory = read_inventory(request, args.kitchen_id, needs_place)
        (directory / 'preimages.json').write_text(json.dumps(inventory, indent=2))
        plan = build_plan(inventory)
        plan['source_hash'] = source_hash
        plan_path.write_text(json.dumps(plan, indent=2))
        print(json.dumps({'hash': digest(plan), 'kitchen_id': args.kitchen_id, 'changes': len(plan['changes']), 'places': len(inventory['places']), 'issues': plan['issues']}))
        return
    plan = json.loads(plan_path.read_text())
    validate_plan(plan)
    if plan.get('source_hash') != source_hash:
        raise RuntimeError('Migration source changed; replan')
    preimages = json.loads((directory / 'preimages.json').read_text())
    rebuilt = build_plan(preimages)
    rebuilt['source_hash'] = source_hash
    if rebuilt != plan:
        raise RuntimeError('Plan differs from protected preimages; replan')
    if args.mode == 'apply':
        if args.confirm != digest(plan):
            raise RuntimeError('Exact plan confirmation hash required')
        export = require_completed_export(request, args.export_operation, bool(plan['dependencies']))
        (directory / 'managed-export.json').write_text(json.dumps(export, indent=2))
        print(json.dumps(apply_plan(request, plan)))
    report = verify_plan(request, plan)
    (directory / 'verification.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report))
    if report['mismatches'] or report['issues']:
        raise RuntimeError('Postimage verification failed or unresolved plan issues remain')
