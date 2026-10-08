"""Offline Project Identity proposal from supplied JSON. No network, apply or deletion mode."""
import argparse
import copy
import hashlib
import json
import os
import re
from pathlib import Path

DATABASE = 'projects/fireux-2005/databases/fireux'
ROOT_KEYS = {'id', 'identity', 'guest_owner_uid', 'created', 'updated'}
IDENTITY_FIELDS = {'name', 'description', 'image_url', 'status'}
LIMITS = {'name': 120, 'description': 2000, 'image_url': 2048}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def utf16_length(value):
    return len(value.encode('utf-16-le', errors='surrogatepass')) // 2


def document_id(value):
    return (isinstance(value, str) and bool(value.strip()) and value.strip() not in ['.', '..']
            and '/' not in value.strip() and not (value.strip().startswith('__') and value.strip().endswith('__'))
            and len(value.strip().encode()) <= 1500)


def stamp(value, app_id=False):
    if not isinstance(value, dict) or set(value) - ({'at', 'by', 'app_id'} if app_id else {'at', 'by'}):
        return False
    at = value.get('at')
    return (isinstance(at, dict) and all(isinstance(at.get(k), (int, float)) and not isinstance(at.get(k), bool) for k in ['seconds', 'nanoseconds'])
            and all(k not in value or isinstance(value[k], str) for k in ['by', 'app_id']))


def propose(root, record_id):
    if not isinstance(root, dict) or set(root) - (ROOT_KEYS | IDENTITY_FIELDS):
        raise ValueError('Unsupported Project root fields')
    if not stamp(root.get('created'), True) or not stamp(root.get('updated')):
        raise ValueError('Invalid or incomplete Project audit fields')
    old = IDENTITY_FIELDS & set(root)
    after = copy.deepcopy(root)
    if old:
        if old != IDENTITY_FIELDS or 'identity' in root:
            raise ValueError('Partial or conflicting Project Identity')
        after['identity'] = {key: after.pop(key) for key in sorted(IDENTITY_FIELDS)}
        status = 'proposed'
    else:
        status = 'already_nested'
    identity = after.get('identity')
    if not isinstance(identity, dict) or set(identity) != IDENTITY_FIELDS:
        raise ValueError('Incomplete or unsupported Project Identity fields')
    if (any(not isinstance(identity[k], str) or utf16_length(identity[k]) > limit for k, limit in LIMITS.items())
            or not identity['name'].strip() or identity['status'] not in ['active', 'inactive', 'archived']):
        raise ValueError('Invalid Project Identity values')
    if 'guest_owner_uid' in after:
        owner = after['guest_owner_uid']
        if not document_id(owner) or owner != record_id or after['created'].get('by') != owner or not document_id(after['created'].get('app_id')):
            raise ValueError('Guest authority does not match the exact Project root')
    return status, after


def build_plan(inventory):
    if not isinstance(inventory, dict) or inventory.get('database') != DATABASE:
        raise ValueError('Inventory must name the canonical FireUX project and database')
    documents = inventory.get('documents')
    if not isinstance(documents, list):
        raise ValueError('documents must contain ordinary JSON Project roots')
    entries, seen = [], set()
    for document in documents:
        if not isinstance(document, dict):
            raise ValueError('Invalid inventory document')
        path = document.get('path')
        if not isinstance(path, str) or not re.fullmatch(r'projects/[^/]+', path) or path in seen or not document_id(path.split('/')[1]):
            raise ValueError('Each exact Project document path must be unique')
        seen.add(path)
        record_id = path.split('/')[1]
        before = copy.deepcopy(document.get('data'))
        if not isinstance(before, dict) or ('id' in before and before['id'] != record_id):
            raise ValueError('Present stored id must match the Project path')
        entry = {'path': path, 'preimage': before, 'preimage_sha256': digest(before), 'update_time': document.get('update_time')}
        try:
            status, after = propose(before, record_id)
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
