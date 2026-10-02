"""Create Gourmador identity and Bären's provisional sourcing links, without offers or access grants."""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from kitchen_ordering_runner import TARGET, BASE, digest

HERE = Path(__file__).resolve().parent
EXTENSIONS = HERE.parents[1] / 'packages/extensions'
SPEC = HERE / 'baren-gourmador.json'
INGREDIENT_SPEC = HERE / 'ingredient-catalogue.json'
KITCHEN = 'ChIJE-GP3-Kjj0cRzAv0WviwcsY'
SUPPLIER = 'gourmador-unterseen'
PLACE = 'ChIJhaIODvqkj0cR7sa782kTOoU'
SUPPLIER_TARGET = 'projects/bringli-b0517/databases/bringli'
SUPPLIER_BASE = f'https://firestore.googleapis.com/v1/{SUPPLIER_TARGET}/documents'
SUPPLIER_BACKUP = 'gs://bringli-b0517-migrations-20260918-7c41/gourmador-identity'
BACKUP = 'gs://misebox-78f9c-firestore-migrations/baren-gourmador-20260918'
COLLECTIONS = {'places', 'companies', 'suppliers', 'supplier-ingredients', 'ingredients'}
_module = importlib.util.spec_from_file_location('ingredient_catalogue', HERE / 'ingredient-catalogue.py')
ingredient = importlib.util.module_from_spec(_module)
_module.loader.exec_module(ingredient)
SOURCE_FILES = [Path(__file__), SPEC, INGREDIENT_SPEC, HERE / 'ingredient-catalogue.py',
                HERE / 'kitchen_ordering_runner.py',
                EXTENSIONS / 'fireux-kitchens/src/runtime/kitchen/models/supplier-ingredient.model.ts',
                EXTENSIONS / 'fireux-suppliers/src/runtime/supplier/models/Supplier.model.ts',
                EXTENSIONS / 'fireux-companies/src/runtime/place/models/company.model.ts',
                EXTENSIONS / 'fireux-places/src/runtime/place/models/place.model.ts']


def target_for(path):
    return TARGET if path.startswith('kitchens/') or path.startswith('ingredients/') else SUPPLIER_TARGET


def encode(value):
    if isinstance(value, bool): return {'booleanValue': value}
    if isinstance(value, str): return {'stringValue': value}
    if isinstance(value, float): return {'doubleValue': value}
    if isinstance(value, list): return {'arrayValue': {'values': [encode(x) for x in value]}}
    if isinstance(value, dict): return {'mapValue': {'fields': {k: encode(v) for k, v in value.items()}}}
    raise ValueError('Unsupported field type')


def fields(value):
    return {k: encode(v) for k, v in value.items()}


def build_plan(inventory, spec, ingredient_ids, timestamp):
    if (spec['kitchen_id'], spec['supplier_id'], spec['place_id']) != (KITCHEN, SUPPLIER, PLACE):
        raise ValueError('Unexpected identity')
    if len(ingredient_ids) != 66 or len(set(ingredient_ids)) != 66:
        raise ValueError('Expected exactly 66 reviewed ingredients')
    if inventory['kitchen']['name'] != f'{TARGET}/documents/kitchens/{KITCHEN}':
        raise ValueError('Bären Kitchen must exist')
    changes, issues = [], []
    stamp = {'mapValue': {'fields': {'at': {'timestampValue': timestamp},
             'by': encode('system:baren-gourmador-20260918')}}}
    company_stamp = {'mapValue': {'fields': {'at': {'timestampValue': timestamp}}}}
    candidates = {
        f'places/{PLACE}': {**fields(spec['place']), 'created': stamp, 'updated': stamp},
        f'companies/{PLACE}': {'created': company_stamp, 'updated': company_stamp},
        f'suppliers/{SUPPLIER}': {**fields({'management': {'mode': 'root'}, 'company_id': PLACE,
            'slug': SUPPLIER, 'status': 'active', 'visibility': True,
            'catalogue_state': 'directory_only', 'delivery_areas': []}), 'created': stamp, 'updated': stamp},
        f'kitchens/{KITCHEN}/suppliers/{SUPPLIER}': {**fields({'supplier_id': SUPPLIER,
            'kitchen_id': KITCHEN,
            'notes': 'Provisional source for the 66 Bären menu ingredients. Confirm individual products with Gourmador before purchasing.'}),
            'created': stamp, 'updated': stamp},
    }
    roots = {d['name'].split('/')[-1]: d for d in inventory['ingredients']}
    usage = {d.get('fields', {}).get('ingredient_id', {}).get('stringValue') for d in inventory['kitchen_ingredients']}
    existing_links = inventory['kitchen_supplier_ingredients']
    for id in ingredient_ids:
        if id not in roots or roots[id].get('fields', {}).get('status', encode('active')) != encode('active') or id not in usage:
            issues.append(f'Ingredient must be active and used by Bären: {id}')
        matches = [d for d in existing_links if d.get('fields', {}).get('supplier_id') == encode(SUPPLIER)
                   and d.get('fields', {}).get('ingredient_id') == encode(id)]
        if len(matches) > 1: issues.append(f'Duplicate existing sourcing links: {id}')
        if matches: continue
        candidates[f'kitchens/{KITCHEN}/supplier-ingredients/{SUPPLIER}--{id}'] = {
            **fields({'kitchen_id': KITCHEN, 'supplier_id': SUPPLIER, 'ingredient_id': id}),
            'created': stamp, 'updated': stamp}
    for path, after in candidates.items():
        before = inventory['targets'].get(path)
        if before:
            expected = {k: v for k, v in after.items() if k not in {'created', 'updated'}}
            actual = {k: before.get('fields', {}).get(k) for k in expected}
            if ingredient.canonical_fields(expected) != ingredient.canonical_fields(actual):
                issues.append(f'Existing identity differs; preserve and review: {path}')
            continue
        changes.append({'name': f'{target_for(path)}/documents/{path}', 'before': None, 'after': after})
    return {'target': TARGET, 'supplier_target': SUPPLIER_TARGET, 'kitchen_id': KITCHEN, 'timestamp': timestamp, 'changes': changes, 'issues': issues}


def validate_plan(plan, ingredient_ids):
    allowed = {f'places/{PLACE}', f'companies/{PLACE}', f'suppliers/{SUPPLIER}', f'kitchens/{KITCHEN}/suppliers/{SUPPLIER}'}
    allowed.update(f'kitchens/{KITCHEN}/supplier-ingredients/{SUPPLIER}--{id}' for id in ingredient_ids)
    if plan['target'] != TARGET or plan.get('supplier_target') != SUPPLIER_TARGET or plan['kitchen_id'] != KITCHEN or plan['issues']:
        raise ValueError('Unexpected target or unresolved issues')
    names = [c['name'] for c in plan['changes']]
    if len(names) != len(set(names)) or len(names) > 70: raise ValueError('Unexpected write count')
    for change in plan['changes']:
        if change['name'] not in {f'{target_for(p)}/documents/{p}' for p in allowed} or change['before'] is not None:
            raise ValueError('Only exact create targets allowed')


def apply_plan(request, plan, ingredient_ids):
    validate_plan(plan, ingredient_ids)
    writes = []
    for change in plan['changes']:
        try: current = request('https://firestore.googleapis.com/v1/' + change['name'])
        except urllib.error.HTTPError as error:
            if error.code != 404: raise
            current = None
        if current:
            if ingredient.canonical_fields(current.get('fields', {})) == ingredient.canonical_fields(change['after']): continue
            raise RuntimeError('Create target appeared since review: ' + change['name'])
        writes.append({'update': {'name': change['name'], 'fields': change['after']}, 'currentDocument': {'exists': False}})
    # Cross-project commits cannot be atomic. Create Supplier identity first;
    # only then create Kitchen references. Each group has create preconditions.
    for target in [SUPPLIER_TARGET, TARGET]:
        group = [w for w in writes if w['update']['name'].startswith(target + '/documents/')]
        if group: request(f'https://firestore.googleapis.com/v1/{target}/documents:commit', {'writes': group})
    return {'applied': len(writes), 'already_applied': len(plan['changes']) - len(writes)}


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['plan', 'apply', 'verify'])
    parser.add_argument('--directory', required=True)
    parser.add_argument('--confirm')
    parser.add_argument('--export-operation')
    parser.add_argument('--supplier-export-operation')
    args = parser.parse_args()
    os.umask(0o077)
    directory = Path(args.directory)
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    if directory.is_symlink() or directory.stat().st_mode & 0o077: raise RuntimeError('Private directory required')
    token = subprocess.check_output(['gcloud', 'auth', 'print-access-token'], text=True).strip()
    def request(url, data=None):
        req = urllib.request.Request(url, data=None if data is None else json.dumps(data).encode(),
            headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response: return json.load(response)
    def listing(path):
        base = SUPPLIER_BASE if path == 'suppliers' else BASE
        result = request(base + '/' + path + '?pageSize=300')
        if result.get('nextPageToken'): raise RuntimeError('Collection exceeds reviewed bound')
        return result.get('documents', [])
    def get(path):
        try: return request(f'https://firestore.googleapis.com/v1/{target_for(path)}/documents/' + path)
        except urllib.error.HTTPError as error:
            if error.code != 404: raise
            return None
    spec = json.loads(SPEC.read_text())
    ids = json.loads(INGREDIENT_SPEC.read_text())['kitchen_ingredient_ids']
    source_hash = digest([p.read_text() for p in SOURCE_FILES])
    if args.mode == 'plan':
        if any(directory.iterdir()): raise RuntimeError('Fresh directory required')
        paths = [f'places/{PLACE}', f'companies/{PLACE}', f'suppliers/{SUPPLIER}', f'kitchens/{KITCHEN}/suppliers/{SUPPLIER}']
        paths.extend(f'kitchens/{KITCHEN}/supplier-ingredients/{SUPPLIER}--{id}' for id in ids)
        links = listing(f'kitchens/{KITCHEN}/supplier-ingredients')
        # The whole root Supplier collection is small and prevents duplicate Company links.
        suppliers = listing('suppliers')
        inventory = {'kitchen': get(f'kitchens/{KITCHEN}'), 'ingredients': listing('ingredients'),
            'kitchen_ingredients': listing(f'kitchens/{KITCHEN}/ingredients'),
            'kitchen_supplier_ingredients': links, 'suppliers': suppliers,
            'targets': {path: get(path) for path in paths[:4]}}
        for path in paths[4:]:
            inventory['targets'][path] = next((d for d in links if d['name'] == f'{TARGET}/documents/{path}'), None)
        plan = build_plan(inventory, spec, ids, datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'))
        if any(d['name'].split('/')[-1] != SUPPLIER and d.get('fields', {}).get('company_id') == encode(PLACE) for d in suppliers):
            plan['issues'].append('Another Supplier already links this Company')
        plan['source_hash'] = source_hash
        (directory / 'preimages.json').write_text(json.dumps(inventory, indent=2))
        (directory / 'plan.json').write_text(json.dumps(plan, indent=2))
        print(json.dumps({'hash': digest(plan), 'changes': len(plan['changes']), 'issues': plan['issues']}))
        return
    plan = json.loads((directory / 'plan.json').read_text())
    if plan['source_hash'] != source_hash: raise RuntimeError('Source changed; replan')
    rebuilt = build_plan(json.loads((directory / 'preimages.json').read_text()), spec, ids, plan['timestamp'])
    rebuilt['source_hash'] = source_hash
    if rebuilt != plan: raise RuntimeError('Plan differs from protected source/preimages')
    validate_plan(plan, ids)
    if args.mode == 'apply':
        if args.confirm != digest(plan): raise RuntimeError('Exact confirmation hash required')
        op = args.export_operation or ''
        if not op.startswith(TARGET + '/operations/'): raise RuntimeError('Exact-target export required')
        export = request('https://firestore.googleapis.com/v1/' + op)
        meta = export.get('metadata', {})
        if not export.get('done') or export.get('error') or meta.get('outputUriPrefix', '').rstrip('/') != BACKUP or not COLLECTIONS.issubset(meta.get('collectionIds', [])):
            raise RuntimeError('Completed exact-scope managed export required')
        (directory / 'managed-export.json').write_text(json.dumps(export, indent=2))
        supplier_op = args.supplier_export_operation or ''
        if not supplier_op.startswith(SUPPLIER_TARGET + '/operations/'):
            raise RuntimeError('Bringli managed export required')
        supplier_export = request('https://firestore.googleapis.com/v1/' + supplier_op)
        sm = supplier_export.get('metadata', {})
        if not supplier_export.get('done') or supplier_export.get('error') or sm.get('outputUriPrefix', '').rstrip('/') != SUPPLIER_BACKUP or not {'places', 'companies', 'suppliers'}.issubset(sm.get('collectionIds', [])):
            raise RuntimeError('Completed Bringli managed export required')
        (directory / 'supplier-managed-export.json').write_text(json.dumps(supplier_export, indent=2))
        print(json.dumps(apply_plan(request, plan, ids)))
    report = ingredient.verify_plan(request, plan)
    (directory / 'verification.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report))
    if report['mismatches']: raise RuntimeError('Postimage mismatch')


if __name__ == '__main__': run()
