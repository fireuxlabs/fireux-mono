"""Offline, create-only proposal for canonical Kitchen access. No network or apply mode."""
import argparse
import copy
import hashlib
import json
import os
from pathlib import Path

DATABASE = 'projects/misebox-78f9c/databases/misebox'
APPS = {'misebox-app', 'baeren-ringgenberg', 'friiites', 'la-tap-berne', 'bangin-coffee', 'interlaken-essen'}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def valid_id(value):
    return isinstance(value, str) and bool(value) and value == value.strip() and '/' not in value and len(value.encode()) <= 1500 and value not in ['.', '..', '__proto__', 'constructor', 'prototype'] and not (value.startswith('__') and value.endswith('__'))


def timestamp(value):
    return isinstance(value, dict) and set(value) == {'seconds', 'nanoseconds'} and type(value['seconds']) is int and type(value['nanoseconds']) is int and 0 <= value['nanoseconds'] < 1000000000


def validate_grant(value, membership):
    if not isinstance(value, dict) or set(value) != {'ids', 'membership_created_at'}:
        raise ValueError('Grant must have exactly ids and membership_created_at')
    ids = value['ids']
    if not isinstance(ids, list) or len(ids) > 50 or any(not valid_id(id) for id in ids) or len(set(ids)) != len(ids):
        raise ValueError('Grant has invalid or over-capacity Kitchen ids')
    bound = value['membership_created_at']
    if not timestamp(bound) or not isinstance(membership, dict) or membership.get('role') not in ['user', 'admin', 'dev'] or membership.get('created', {}).get('at') != bound:
        raise ValueError('Grant must match current eligible App membership')


def build_plan(inventory):
    if inventory.get('database') != DATABASE or set(inventory.get('inventoried_apps', [])) != APPS:
        raise ValueError('Require exact Misebox database and complete supported-App inventory')
    documents, destinations = inventory.get('documents'), inventory.get('destinations')
    if not isinstance(documents, list) or not isinstance(destinations, list):
        raise ValueError('Require source grants and inspected canonical destinations')
    groups, seen, preimages = {}, set(), []
    for document in documents:
        path = document.get('path', '')
        parts = path.split('/')
        if len(parts) != 4 or parts[0] != 'kitchen_access' or parts[1] not in APPS or parts[2] != 'users' or not valid_id(parts[3]) or path in seen:
            raise ValueError('Invalid or duplicate source grant path')
        if not document.get('update_time') or not document.get('membership_update_time'):
            raise ValueError('Source and membership revisions are required')
        validate_grant(document.get('data'), document.get('membership'))
        seen.add(path)
        groups.setdefault(parts[3], {})[parts[1]] = copy.deepcopy(document['data'])
        preimages.append(copy.deepcopy(document) | {'sha256': digest(document['data'])})
    existing = {}
    for destination in destinations:
        path = destination.get('path', '')
        parts = path.split('/')
        if len(parts) != 2 or parts[0] != 'kitchen_access' or parts[1] not in groups or path in existing or type(destination.get('exists')) is not bool:
            raise ValueError('Invalid or duplicate canonical destination evidence')
        if destination['exists'] and (not destination.get('update_time') or not isinstance(destination.get('data'), dict)):
            raise ValueError('Existing destination requires full preimage and revision')
        existing[path] = copy.deepcopy(destination)
    if set(existing) != {'kitchen_access/' + uid for uid in groups}:
        raise ValueError('Every destination must be explicitly inspected')
    entries = []
    for uid, apps in sorted(groups.items()):
        path, data = 'kitchen_access/' + uid, {'apps': apps}
        before = existing[path]
        status = 'create_only' if not before['exists'] else 'already_matches' if before['data'] == data else 'conflict'
        sources = [row for row in preimages if row['path'].split('/')[-1] == uid]
        entries.append({'path': path, 'status': status, 'data': data, 'sha256': digest(data),
                        'precondition': {'exists': False} if status == 'create_only' else None,
                        'retirement_proposals': [{'path': row['path'], 'update_time': row['update_time'], 'sha256': row['sha256']} for row in sources] if status != 'conflict' else []})
    return {'database': DATABASE, 'offline_only': True, 'apply_supported': False, 'captured_at': inventory.get('captured_at'),
            'conditions': ['Revalidate exact source and destination revisions plus current memberships immediately before any future application',
                           'Validate every target with the current Kitchen domain validator',
                           'Create only absent targets; never overwrite a conflicting authority index',
                           'Retire source grants only after exact canonical postimages are independently verified'],
            'preimages': preimages, 'destinations': list(existing.values()), 'entries': entries}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    plan = build_plan(json.loads(args.input.read_text()))
    with os.fdopen(os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as out:
        out.write(json.dumps(plan, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'source_grants': len(plan['preimages']), 'destinations': len(plan['entries']), 'conflicts': sum(row['status'] == 'conflict' for row in plan['entries']), 'offline_only': True}))


if __name__ == '__main__':
    main()
