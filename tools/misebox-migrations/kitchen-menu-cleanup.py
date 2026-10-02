"""Exact-target Misebox Kitchen/Menu migration. Plan first; apply requires its SHA256.
Uses Firestore REST values unchanged to preserve stamps and unrelated fields.
Credentials remain in memory. No collection/document creation or record deletion.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.request

TARGET = 'projects/misebox-78f9c/databases/misebox'
BASE = 'https://firestore.googleapis.com/v1/' + TARGET + '/documents'
PALETTE = {'canvas': '#f8fafc', 'text': '#0f172a', 'accent': '#0f766e', 'accent_contrast': '#ffffff'}
RETIRED_MENU = ['id', 'kitchen_id', 'system_kind', 'kiosk_skin_id', 'choices', 'theme']
DOC_KEYS = ['url', 'name', 'type', 'storage_path']

def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':')).encode()

def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()

def string(value):
    return value.get('stringValue', '') if isinstance(value, dict) else ''

def fields(value):
    return value.get('mapValue', {}).get('fields', {}) if isinstance(value, dict) else {}

def encode_map(value):
    return {'mapValue': {'fields': {k: {'stringValue': v} for k, v in value.items()}}}

def build_plan(inventory):
    changes, issues = [], []
    places = {d['name'].split('/')[-1]: d.get('fields', {}) for d in inventory['places']}
    for record in inventory['kitchens'] + inventory['menus']:
        before = record.get('fields', {})
        after = dict(before)
        path = record['name'].split('/documents/')[1]
        if len(path.split('/')) == 2:
            place_currency = string(places.get(path.split('/')[-1], {}).get('default_currency_code')).strip().upper()
            current_currency = string(before.get('currency')).strip().upper()
            valid = lambda value: len(value) == 3 and value.isascii() and value.isalpha() and value.isupper()
            if current_currency and place_currency and current_currency != place_currency:
                issues.append({'path': path, 'reason': 'Currency conflicts with Place; retained Kitchen currency'})
            if not current_currency and valid(place_currency):
                after['currency'] = {'stringValue': place_currency}
            elif not valid(current_currency):
                issues.append({'path': path, 'reason': 'Currency missing or invalid; requires explicit choice'})
            theme = before.get('theme')
            if not theme:
                after['theme'] = {'mapValue': {'fields': {'palette': encode_map(PALETTE)}}}
            elif not fields(fields(theme).get('palette')):
                issues.append({'path': path, 'reason': 'Existing theme lacks palette; retained for review'})
            after.pop('menus', None)
        else:
            if 'sort_order' not in before:
                after['sort_order'] = {'integerValue': '0'}
            legacy = {key: string(before.get('doc_' + key)) for key in DOC_KEYS}
            if any(legacy.values()):
                desired = encode_map(legacy)
                if not all(legacy.values()):
                    issues.append({'path': path, 'reason': 'Incomplete document metadata; document fields retained for correction'})
                elif 'doc' in before and before['doc'] != desired:
                    issues.append({'path': path, 'reason': 'Conflicting document metadata; document fields retained for correction'})
                else:
                    after['doc'] = desired
                    for key in DOC_KEYS: after.pop('doc_' + key, None)
            else:
                for key in DOC_KEYS: after.pop('doc_' + key, None)
            for key in RETIRED_MENU: after.pop(key, None)
        changed = sorted(k for k in before.keys() | after.keys() if before.get(k) != after.get(k))
        if changed:
            changes.append({'name': record['name'], 'updateTime': record['updateTime'], 'before': before, 'after': after, 'changed': changed})
    return {'target': TARGET, 'changes': changes, 'issues': issues}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['plan', 'apply', 'verify'])
    parser.add_argument('--directory', required=True)
    parser.add_argument('--confirm')
    parser.add_argument('--export-operation')
    args = parser.parse_args()
    os.umask(0o077)
    directory = Path(args.directory)
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    token = subprocess.check_output(['gcloud', 'auth', 'print-access-token'], text=True).strip()
    def request(url, data=None):
        req = urllib.request.Request(url, data=None if data is None else json.dumps(data).encode(), headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response: return json.load(response)
    def listing(path):
        result, page = [], ''
        while True:
            data = request(BASE + '/' + path + '?pageSize=300' + ('&pageToken=' + page if page else ''))
            result.extend(data.get('documents', []))
            page = data.get('nextPageToken', '')
            if not page: return result
    source_hash = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    plan_path = directory / 'plan.json'
    if args.mode == 'plan':
        if plan_path.exists(): raise RuntimeError('Use a fresh directory to preserve existing preimages')
        kitchens = listing('kitchens')
        inventory = {'kitchens': kitchens, 'places': listing('places'), 'menus': []}
        for kitchen in kitchens: inventory['menus'].extend(listing('kitchens/' + kitchen['name'].split('/')[-1] + '/menus'))
        (directory / 'preimages.json').write_text(json.dumps(inventory, indent=2))
        plan = build_plan(inventory)
        plan['source_hash'] = source_hash
        plan_path.write_text(json.dumps(plan, indent=2))
        print(json.dumps({'hash': digest(plan), 'kitchens': len(kitchens), 'menus': len(inventory['menus']), 'changes': len(plan['changes']), 'issues': plan['issues']}))
        return
    plan = json.loads(plan_path.read_text())
    if plan['target'] != TARGET or plan['source_hash'] != source_hash: raise RuntimeError('Target or source changed; replan')
    if args.mode == 'apply':
        if args.confirm != digest(plan): raise RuntimeError('Exact plan confirmation hash required')
        if not args.export_operation or not args.export_operation.startswith(TARGET + '/operations/'): raise RuntimeError('Exact-target managed export operation required')
        export = request('https://firestore.googleapis.com/v1/' + args.export_operation)
        if not export.get('done') or export.get('error'): raise RuntimeError('Managed export is not successfully complete')
        metadata = export.get('metadata', {})
        if not {'kitchens', 'menus', 'places'}.issubset(metadata.get('collectionIds', [])): raise RuntimeError('Backup scope incomplete')
        (directory / 'managed-export.json').write_text(json.dumps(export, indent=2))
        writes = []
        for change in plan['changes']:
            if not change['name'].startswith(TARGET + '/documents/kitchens/'): raise RuntimeError('Unexpected target')
            current = request('https://firestore.googleapis.com/v1/' + change['name'])
            if current.get('fields', {}) == change['after']: continue
            if current['updateTime'] != change['updateTime'] or current.get('fields', {}) != change['before']: raise RuntimeError('Record changed since review: ' + change['name'])
            writes.append({'update': {'name': change['name'], 'fields': {k: change['after'][k] for k in change['changed'] if k in change['after']}}, 'updateMask': {'fieldPaths': change['changed']}, 'currentDocument': {'updateTime': change['updateTime']}})
        if len(writes) > 450: raise RuntimeError('Scope exceeds one bounded atomic commit')
        if writes: request(BASE + ':commit', {'writes': writes})
        print(json.dumps({'applied': len(writes), 'already_applied': len(plan['changes']) - len(writes)}))
    mismatches = []
    for change in plan['changes']:
        actual = request('https://firestore.googleapis.com/v1/' + change['name'])
        if actual.get('fields', {}) != change['after']: mismatches.append(change['name'])
    report = {'verified': len(plan['changes']) - len(mismatches), 'mismatches': mismatches, 'issues': plan['issues']}
    (directory / 'verification.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report))
    if mismatches: raise RuntimeError('Postimage verification failed')

if __name__ == '__main__': main()
