"""Exact-target Kitchen ordering migration: backup, preimages, CAS and verification."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.request

TARGET = 'projects/misebox-78f9c/databases/misebox'
BASE = f'https://firestore.googleapis.com/v1/{TARGET}/documents'
BACKUP = 'gs://misebox-78f9c-firestore-migrations/kitchen-ordering-20260916'


def digest(value):
    payload = json.dumps(value, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(payload.encode()).hexdigest()


def require_completed_export(request, operation):
    if not operation or not operation.startswith(f'{TARGET}/operations/'):
        raise RuntimeError('Exact-target managed export operation required')
    export = request(f'https://firestore.googleapis.com/v1/{operation}')
    if not export.get('done') or export.get('error'):
        raise RuntimeError('Managed export is not successfully complete')
    metadata = export.get('metadata', {})
    if metadata.get('outputUriPrefix', '').rstrip('/') != BACKUP:
        raise RuntimeError('Backup destination differs from the reviewed destination')
    if not {'kitchens', 'menus'}.issubset(metadata.get('collectionIds', [])):
        raise RuntimeError('Backup scope incomplete')
    return export


def apply_plan(request, plan):
    if plan.get('issues'):
        raise RuntimeError('Resolve migration issues before applying')
    writes = []
    for change in plan['changes']:
        if not change['name'].startswith(f'{TARGET}/documents/kitchens/'):
            raise RuntimeError('Unexpected target')
        current = request(f"https://firestore.googleapis.com/v1/{change['name']}")
        if current.get('fields', {}) == change['after']:
            continue
        if (
            current['updateTime'] != change['updateTime']
            or current.get('fields', {}) != change['before']
        ):
            raise RuntimeError(f"Record changed since review: {change['name']}")
        writes.append({
            'update': {
                'name': change['name'],
                'fields': {
                    key: change['after'][key]
                    for key in change['changed']
                    if key in change['after']
                },
            },
            'updateMask': {'fieldPaths': change['changed']},
            'currentDocument': {'updateTime': change['updateTime']},
        })
    if len(writes) > 450:
        raise RuntimeError('Scope exceeds one bounded atomic commit')
    if writes:
        request(f'{BASE}:commit', {'writes': writes})
    return {
        'applied': len(writes),
        'already_applied': len(plan['changes']) - len(writes),
    }


def verify_plan(request, plan):
    mismatches = []
    for change in plan['changes']:
        actual = request(f"https://firestore.googleapis.com/v1/{change['name']}")
        if actual.get('fields', {}) != change['after']:
            mismatches.append(change['name'])
    return {
        'verified': len(plan['changes']) - len(mismatches),
        'mismatches': mismatches,
        'issues': plan['issues'],
    }


def run(build_plan, source_files):
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['plan', 'apply', 'verify'])
    parser.add_argument('--directory', required=True)
    parser.add_argument('--confirm')
    parser.add_argument('--export-operation')
    args = parser.parse_args()
    os.umask(0o077)
    directory = Path(args.directory)
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    token = subprocess.check_output(
        ['gcloud', 'auth', 'print-access-token'], text=True
    ).strip()

    def request(url, data=None):
        req = urllib.request.Request(
            url,
            data=None if data is None else json.dumps(data).encode(),
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
            },
        )
        with urllib.request.urlopen(req) as response:
            return json.load(response)

    def listing(path):
        records, page = [], ''
        while True:
            query = '?pageSize=300' + (f'&pageToken={page}' if page else '')
            data = request(f'{BASE}/{path}{query}')
            records.extend(data.get('documents', []))
            page = data.get('nextPageToken', '')
            if not page:
                return records

    source_hash = digest([Path(path).read_text() for path in source_files])
    plan_path = directory / 'plan.json'
    if args.mode == 'plan':
        if plan_path.exists():
            raise RuntimeError('Use a fresh directory to preserve existing preimages')
        kitchens = listing('kitchens')
        inventory = {'kitchens': kitchens, 'menus': []}
        for kitchen in kitchens:
            kitchen_id = kitchen['name'].split('/')[-1]
            inventory['menus'].extend(listing(f'kitchens/{kitchen_id}/menus'))
        (directory / 'preimages.json').write_text(json.dumps(inventory, indent=2))
        plan = build_plan(inventory)
        plan['source_hash'] = source_hash
        plan_path.write_text(json.dumps(plan, indent=2))
        print(json.dumps({
            'hash': digest(plan),
            'kitchens': len(kitchens),
            'menus': len(inventory['menus']),
            'changes': len(plan['changes']),
            'unchanged': len(kitchens) + len(inventory['menus']) - len(plan['changes']),
            'issues': plan['issues'],
        }))
        return

    plan = json.loads(plan_path.read_text())
    if plan['target'] != TARGET or plan['source_hash'] != source_hash:
        raise RuntimeError('Target or source changed; replan')
    if args.mode == 'apply':
        if args.confirm != digest(plan):
            raise RuntimeError('Exact plan confirmation hash required')
        export = require_completed_export(request, args.export_operation)
        (directory / 'managed-export.json').write_text(json.dumps(export, indent=2))
        print(json.dumps(apply_plan(request, plan)))
    report = verify_plan(request, plan)
    (directory / 'verification.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report))
    if report['mismatches']:
        raise RuntimeError('Postimage verification failed')
