"""Offline Supplier configuration proposal over a supplied JSON inventory. No network or apply mode."""
import argparse
import copy
import hashlib
import json
import os
import re
from pathlib import Path

DATABASE = 'projects/bringli-b0517/databases/bringli'
ROOT_KEYS = {'id', 'company_id', 'management', 'identity', 'catalogue', 'delivery', 'created', 'updated'}
OLD_KEYS = {'slug', 'status', 'visibility', 'catalogue_state', 'delivery_areas'}
MAP_KEYS = {'identity', 'catalogue', 'delivery'}


def utf16_length(value):
    return len(value.encode('utf-16-le', errors='surrogatepass')) // 2


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def validate_configuration(root):
    identity, catalogue, delivery = (root.get(key) for key in ['identity', 'catalogue', 'delivery'])
    if not isinstance(identity, dict) or set(identity) != {'slug', 'status', 'visibility'}:
        raise ValueError('Incomplete or unsupported Supplier identity fields')
    if not isinstance(identity['slug'], str) or not identity['slug'].strip() or utf16_length(identity['slug']) > 200:
        raise ValueError('Invalid Supplier slug')
    if identity['status'] not in ['active', 'inactive', 'archived'] or type(identity['visibility']) is not bool:
        raise ValueError('Invalid Supplier publication values')
    if not isinstance(catalogue, dict) or set(catalogue) != {'mode'} or catalogue['mode'] not in ['integrated', 'directory_only']:
        raise ValueError('Invalid Supplier catalogue mode')
    if not isinstance(delivery, dict) or set(delivery) != {'areas'}:
        raise ValueError('Incomplete or unsupported Supplier delivery fields')
    areas = delivery['areas']
    if not isinstance(areas, list) or len(areas) > 100 or any(not isinstance(area, str) or not area.strip() or utf16_length(area) > 160 for area in areas):
        raise ValueError('Invalid Supplier delivery areas')


def propose(root):
    if not isinstance(root, dict) or set(root) - (ROOT_KEYS | OLD_KEYS):
        raise ValueError('Unsupported Supplier root fields')
    required = {'company_id', 'management', 'created', 'updated'}
    if not required.issubset(root):
        raise ValueError('Incomplete Supplier relationship, management or audit fields')
    old_fields = OLD_KEYS & set(root)
    if old_fields:
        if old_fields != OLD_KEYS:
            raise ValueError('Incomplete old Supplier configuration')
        if MAP_KEYS & set(root):
            raise ValueError('Conflicting old and nested Supplier authorities')
        after = copy.deepcopy(root)
        after['identity'] = {key: after.pop(key) for key in ['slug', 'status', 'visibility']}
        after['catalogue'] = {'mode': after.pop('catalogue_state')}
        after['delivery'] = {'areas': after.pop('delivery_areas')}
        status = 'proposed'
    else:
        after = copy.deepcopy(root)
        status = 'already_nested'
    validate_configuration(after)
    return status, after


def build_plan(inventory):
    if not isinstance(inventory, dict) or inventory.get('database') != DATABASE:
        raise ValueError('Supplier inventory must name the canonical Bringli project and database')
    documents = inventory.get('documents')
    if not isinstance(documents, list):
        raise ValueError('documents must be a list of ordinary JSON Supplier roots')
    entries, seen = [], set()
    for document in documents:
        if not isinstance(document, dict):
            raise ValueError('Invalid inventory document')
        path = document.get('path')
        if not isinstance(path, str) or not re.fullmatch(r'suppliers/[^/]+', path) or path in seen:
            raise ValueError('Each exact Supplier document path must be unique')
        seen.add(path)
        before = copy.deepcopy(document.get('data'))
        if not isinstance(before, dict) or ('id' in before and before['id'] != path.split('/')[1]):
            raise ValueError('A present stored Supplier id must match the inventory path')
        entry = {'path': path, 'preimage': before, 'preimage_sha256': digest(before), 'update_time': document.get('update_time')}
        try:
            status, after = propose(before)
            entry.update(status=status, proposed=after, proposed_sha256=digest(after), warnings=[])
        except ValueError as error:
            entry.update(status='invalid', proposed=None, warnings=[str(error)])
        entries.append(entry)
    return {'database': DATABASE, 'offline_only': True, 'apply_supported': False,
            'target_validation_required': True, 'entries': entries}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    plan = build_plan(json.loads(args.input.read_text()))
    with os.fdopen(os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as output:
        output.write(json.dumps(plan, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'documents': len(plan['entries']), 'offline_only': True}))


if __name__ == '__main__':
    main()
