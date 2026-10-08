"""Offline Portfolio identity proposal over a supplied JSON inventory. No network or apply mode."""
import argparse
import copy
import hashlib
import json
import os
import re
from pathlib import Path

DATABASE = 'projects/granite-ecosystem/databases/granite'
ROOT_KEYS = {'id', 'management', 'identity', 'created', 'updated'}
IDENTITY_FIELDS = {'name', 'tagline', 'image_url', 'slug', 'status', 'owner_label', 'strategy_label', 'region_label', 'notes'}
LIMITS = {'name': 160, 'tagline': 240, 'image_url': 2048, 'slug': 240,
          'owner_label': 160, 'strategy_label': 160, 'region_label': 160, 'notes': 4000}


def utf16_length(value):
    return len(value.encode('utf-16-le', errors='surrogatepass')) // 2


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def propose(root, document_id):
    if not isinstance(root, dict) or set(root) - (ROOT_KEYS | IDENTITY_FIELDS):
        raise ValueError('Unsupported Portfolio root fields')
    if not {'management', 'created', 'updated'}.issubset(root):
        raise ValueError('Incomplete Portfolio management or audit fields')
    old_fields = IDENTITY_FIELDS & set(root)
    after = copy.deepcopy(root)
    if old_fields:
        if old_fields != IDENTITY_FIELDS:
            raise ValueError('Incomplete old Portfolio identity')
        if 'identity' in root:
            raise ValueError('Conflicting old and nested Portfolio authorities')
        after['identity'] = {key: after.pop(key) for key in sorted(IDENTITY_FIELDS)}
        status = 'proposed'
    else:
        status = 'already_nested'
    identity = after.get('identity')
    if not isinstance(identity, dict) or set(identity) != IDENTITY_FIELDS:
        raise ValueError('Incomplete or unsupported Portfolio identity fields')
    if any(not isinstance(identity[key], str) or utf16_length(identity[key]) > maximum for key, maximum in LIMITS.items()):
        raise ValueError('Invalid Portfolio text fields')
    if not identity['name'].strip() or identity['slug'].strip() != document_id or identity['status'] not in ['active', 'archived']:
        raise ValueError('Invalid Portfolio name, route identity or publication status')
    return status, after


def build_plan(inventory):
    if not isinstance(inventory, dict) or inventory.get('database') != DATABASE:
        raise ValueError('Portfolio inventory must name the canonical Granite project and database')
    documents = inventory.get('documents')
    if not isinstance(documents, list):
        raise ValueError('documents must be a list of ordinary JSON Portfolio roots')
    entries, seen = [], set()
    for document in documents:
        if not isinstance(document, dict):
            raise ValueError('Invalid inventory document')
        path = document.get('path')
        if not isinstance(path, str) or not re.fullmatch(r'portfolios/[^/]+', path) or path in seen:
            raise ValueError('Each exact Portfolio document path must be unique')
        seen.add(path)
        document_id = path.split('/')[1]
        before = copy.deepcopy(document.get('data'))
        if not isinstance(before, dict) or ('id' in before and before['id'] != document_id):
            raise ValueError('A present stored Portfolio id must match the inventory path')
        entry = {'path': path, 'preimage': before, 'preimage_sha256': digest(before), 'update_time': document.get('update_time')}
        try:
            status, after = propose(before, document_id)
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
