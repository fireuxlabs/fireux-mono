"""Offline Offering child-record proposal from an explicitly supplied inventory. No network or apply mode."""
import argparse
import copy
import hashlib
import json
import os
import re
from pathlib import Path

DATABASE = 'projects/misebox-78f9c/databases/misebox'


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def valid_id(value):
    return isinstance(value, str) and bool(value.strip()) and value == value.strip() and value not in ['.', '..'] and not (value.startswith('__') and value.endswith('__')) and '/' not in value and len(value.encode('utf-8')) <= 1500


def build_plan(inventory):
    if not isinstance(inventory, dict) or inventory.get('database') != DATABASE:
        raise ValueError('Inventory must name the canonical Misebox project and database')
    documents = inventory.get('documents')
    if not isinstance(documents, list):
        raise ValueError('documents must contain ordinary JSON Kitchen roots and Offering children')
    roots, children, preimages = {}, {}, []
    for document in documents:
        if not isinstance(document, dict):
            raise ValueError('Invalid inventory document')
        path, data = document.get('path'), document.get('data')
        parts = path.split('/') if isinstance(path, str) else []
        if not (len(parts) == 2 and parts[0] == 'kitchens' or len(parts) == 4 and parts[0] == 'kitchens' and parts[2] == 'offerings') or not all(valid_id(part) for part in parts):
            raise ValueError('Unexpected document target')
        if any(row['path'] == path for row in preimages) or not isinstance(data, dict):
            raise ValueError('Duplicate path or malformed document data')
        saved = {'path': path, 'data': copy.deepcopy(data), 'sha256': digest(data), 'update_time': document.get('update_time')}
        preimages.append(saved)
        (roots if len(parts) == 2 else children)[path] = saved
    if any('/'.join(path.split('/')[:2]) not in roots for path in children):
        raise ValueError('Every child must have its exact Kitchen root in the supplied inventory')
    entries = []
    for path, root in roots.items():
        before = root['data']
        entry = {'path': path, 'preimage_sha256': root['sha256'], 'update_time': root['update_time'], 'create_only_children': [], 'root_proposal': None, 'warnings': []}
        if 'services' not in before:
            entry['status'] = 'no_root_array'
            entries.append(entry)
            continue
        rows = before['services']
        if not isinstance(rows, list):
            entry.update(status='invalid', warnings=['Root services preimage is not an array'])
            entries.append(entry)
            continue
        ids, proposals, conflicts = set(), [], []
        for value in rows:
            if not isinstance(value, dict) or not valid_id(value.get('id')) or value['id'] in ids:
                conflicts.append('Invalid or duplicate Offering identity')
                continue
            id = value['id']
            ids.add(id)
            data = copy.deepcopy(value)
            del data['id']
            child_path = path + '/offerings/' + id
            child = children.get(child_path)
            if child is not None:
                if child['data'] != data:
                    conflicts.append('Existing child differs: ' + child_path)
                continue
            proposals.append({'path': child_path, 'data': data, 'sha256': digest(data), 'precondition': {'exists': False}})
        if conflicts:
            entry.update(status='conflict', warnings=conflicts)
        else:
            after = copy.deepcopy(before)
            del after['services']
            entry.update(status='needs_target_validation', create_only_children=proposals,
                         root_proposal={'data': after, 'sha256': digest(after), 'removed_fields': ['services']})
        entries.append(entry)
    return {'database': DATABASE, 'offline_only': True, 'apply_supported': False,
            'target_validation_required': True,
            'conditions': ['Validate every proposed and existing child with the current canonical Offering reader',
                           'Prove the supplied inventory is complete and compare every preimage/revision before any future application',
                           'Retire the root array only after the complete canonical child set is verified'],
            'preimages': preimages, 'entries': entries}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    plan = build_plan(json.loads(args.input.read_text()))
    with os.fdopen(os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as output:
        output.write(json.dumps(plan, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'roots': len(plan['entries']), 'offline_only': True, 'apply_supported': False}))


if __name__ == '__main__':
    main()
