"""Bounded Misebox Ingredient category migration and Bären food-input seed.

Preserves all existing IDs, unrelated fields and legacy retirement metadata.
Creates missing canonical inputs and exact Kitchen usage links only. No supplier
products, prices, recipe records, stock or order configuration are written.
"""
import argparse
import copy
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from kitchen_ordering_runner import TARGET, BASE, digest

HERE = Path(__file__).resolve().parent
EXTENSIONS = HERE.parents[1] / 'packages/extensions'
SPEC = HERE / 'ingredient-catalogue.json'
KITCHEN = 'ChIJE-GP3-Kjj0cRzAv0WviwcsY'
BACKUP = 'gs://misebox-78f9c-firestore-migrations/ingredient-catalogue-20260918'
SOURCE_FILES = [Path(__file__), SPEC, HERE / 'kitchen_ordering_runner.py',
    EXTENSIONS / 'fireux-kitchens/src/runtime/ingredient/models/ingredient.model.ts',
    EXTENSIONS / 'fireux-kitchens/src/runtime/ingredient/models/ingredient-taxonomy.ts',
    EXTENSIONS / 'fireux-kitchens/src/runtime/ingredient/server/curation-storage.ts',
    EXTENSIONS / 'fireux-kitchens/src/runtime/ingredient/server/curation.ts']


def string(value):
    return {'stringValue': value}


def validate_name(name):
    relative = name.removeprefix(f'{TARGET}/documents/')
    if name == relative or not re.fullmatch(
        rf'(?:ingredients|kitchens/{KITCHEN}/ingredients)/[a-z0-9][a-z0-9-]*', relative
    ):
        raise ValueError('Mutation outside exact Ingredient/Kitchen Ingredient scope')


def build_plan(inventory, spec, timestamp):
    if spec.get('kitchen_id') != KITCHEN:
        raise ValueError('Unexpected Kitchen')
    changes, issues = [], []
    roots = {d['name'].split('/')[-1]: d for d in inventory['ingredients']}
    links = {d['name'].split('/')[-1]: d for d in inventory['kitchen_ingredients']}
    if inventory['kitchen']['name'] != f'{TARGET}/documents/kitchens/{KITCHEN}':
        raise ValueError('Bären Kitchen must exist')
    updated = {'mapValue': {'fields': {'at': {'timestampValue': timestamp},
        'by': string('system:ingredient-catalogue-20260918')}}}
    created = copy.deepcopy(updated)
    created['mapValue']['fields']['app_id'] = string('misebox-app')

    def change(document, name, after):
        validate_name(name)
        before = document.get('fields', {}) if document else None
        if before == after:
            return
        fields = sorted(k for k in set(before or {}) | set(after)
                        if (before or {}).get(k) != after.get(k))
        changes.append({'name': name, 'before': before, 'after': after,
                        'changed': fields, 'updateTime': document.get('updateTime') if document else None})

    for id, document in roots.items():
        if id not in spec['categories'] and id not in {x['id'] for x in spec['additions']}:
            issues.append(f'Unreviewed ingredient: {id}')
            continue
        if id not in spec['categories']:
            continue
        before = document['fields']
        after = copy.deepcopy(before)
        after['category'] = string(spec['categories'][id])
        after['schema_version'] = {'integerValue': '3'}
        if after != before:
            after['updated'] = updated
        change(document, document['name'], after)

    all_ids = set(roots)
    terms = {}
    for id, document in roots.items():
        fields = document['fields']
        for term in [fields.get('name', {}).get('stringValue', '')] + [x.get('stringValue','') for x in fields.get('aliases',{}).get('arrayValue',{}).get('values',[])]:
            if term: terms.setdefault(term.strip().casefold(), set()).add(id)
    for item in spec['additions']:
        id = item['id']; all_ids.add(id)
        if id in roots:
            fields = roots[id]['fields']
            if fields.get('name') != string(item['name']) or fields.get('category') != string(item['category']):
                issues.append(f'Existing seed identity differs: {id}')
            if fields.get('status', string('active')) != string('active'):
                issues.append(f'Seed identity is retired: {id}')
            continue
        if any(terms.get(t.casefold()) for t in [item['name'], *item['aliases']]):
            issues.append(f'Seed name/alias conflicts with an existing identity: {id}')
            continue
        for term in [item['name'], *item['aliases']]:terms.setdefault(term.casefold(),set()).add(id)
        after = {'name':string(item['name']), 'slug':string(id),
            'aliases':{'arrayValue':{'values':[string(x) for x in item['aliases']]}},
            'category':string(item['category']), 'schema_version':{'integerValue':'3'},
            'status':string('active'), 'created':created, 'updated':updated}
        change(None, f'{TARGET}/documents/ingredients/{id}', after)

    for id in spec['kitchen_ingredient_ids']:
        if id not in all_ids:
            issues.append(f'Kitchen link has no canonical identity: {id}')
            continue
        if id in roots and roots[id]['fields'].get('status',string('active')) != string('active'):
            issues.append(f'Kitchen link would use a retired identity: {id}')
            continue
        existing = [d for d in links.values() if d.get('fields',{}).get('ingredient_id') == string(id)]
        if existing:
            continue
        if id in links:
            issues.append(f'Kitchen link id already has another meaning: {id}')
            continue
        change(None, f'{TARGET}/documents/kitchens/{KITCHEN}/ingredients/{id}',
               {'ingredient_id':string(id), 'created':created, 'updated':updated})
    if len(changes) > 450:
        issues.append('Plan exceeds one bounded atomic commit')
    return {'target':TARGET,'kitchen_id':KITCHEN,'timestamp':timestamp,
            'changes':changes,'issues':issues}


def validate_plan(plan):
    if plan['target'] != TARGET or plan['kitchen_id'] != KITCHEN or plan['issues']:
        raise ValueError('Plan target differs or unresolved issues remain')
    if len(plan['changes']) > 450: raise ValueError('Too many writes')
    for change in plan['changes']:
        validate_name(change['name'])
        if change['before'] is not None:
            if '/documents/ingredients/' not in change['name']:
                raise ValueError('Existing Kitchen links cannot be modified')
            if not set(change['changed']).issubset({'category','schema_version','updated'}):
                raise ValueError('Existing ingredient identity/metadata cannot be retired or altered')
            for k,v in change['before'].items():
                if k not in change['changed'] and change['after'].get(k) != v:
                    raise ValueError('Unrelated field changed')


def canonical_fields(value):
    """Firestore omits `values`/`fields` for empty arrays/maps in REST responses."""
    if isinstance(value, dict):
        if 'arrayValue' in value:
            return {'arrayValue': {'values': [canonical_fields(x) for x in value['arrayValue'].get('values', [])]}}
        if 'mapValue' in value:
            return {'mapValue': {'fields': canonical_fields(value['mapValue'].get('fields', {}))}}
        return {k: canonical_fields(v) for k, v in value.items()}
    if isinstance(value, list):
        return [canonical_fields(x) for x in value]
    return value


def verify_plan(request, plan):
    mismatches = []
    for change in plan['changes']:
        actual = request('https://firestore.googleapis.com/v1/' + change['name'])
        if canonical_fields(actual.get('fields', {})) != canonical_fields(change['after']):
            mismatches.append(change['name'])
    return {'verified': len(plan['changes']) - len(mismatches), 'mismatches': mismatches, 'issues': plan['issues']}


def apply_plan(request, plan):
    validate_plan(plan)
    writes=[]
    for change in plan['changes']:
        try:actual=request('https://firestore.googleapis.com/v1/'+change['name'])
        except urllib.error.HTTPError as error:
            if error.code != 404:raise
            actual=None
        if actual and canonical_fields(actual.get('fields',{})) == canonical_fields(change['after']):continue
        if change['before'] is None:
            if actual:raise RuntimeError('Create target appeared since review: '+change['name'])
            writes.append({'update':{'name':change['name'],'fields':change['after']},'currentDocument':{'exists':False}})
        else:
            if not actual or actual.get('updateTime') != change['updateTime'] or actual.get('fields',{}) != change['before']:
                raise RuntimeError('Record changed since review: '+change['name'])
            writes.append({'update':{'name':change['name'],'fields':{k:change['after'][k] for k in change['changed']}},
                'updateMask':{'fieldPaths':change['changed']},'currentDocument':{'updateTime':change['updateTime']}})
    if writes:request(BASE+':commit',{'writes':writes})
    return {'applied':len(writes),'already_applied':len(plan['changes'])-len(writes)}


def run():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode',choices=['plan','apply','verify'])
    parser.add_argument('--directory',required=True)
    parser.add_argument('--confirm')
    parser.add_argument('--export-operation')
    args=parser.parse_args();os.umask(0o077)
    directory=Path(args.directory)
    directory.mkdir(parents=True,exist_ok=True,mode=0o700)
    if directory.is_symlink() or directory.stat().st_mode & 0o077:raise RuntimeError('Private directory required')
    token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
    def request(url,data=None):
        req=urllib.request.Request(url,data=None if data is None else json.dumps(data).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
        with urllib.request.urlopen(req) as response:return json.load(response)
    def listing(path):
        docs=[];page=''
        while True:
            result=request(BASE+'/'+path+'?pageSize=300'+('&pageToken='+urllib.parse.quote(page,safe='') if page else ''))
            docs+=result.get('documents',[]);page=result.get('nextPageToken')
            if len(docs)>500:raise RuntimeError('Collection exceeds reviewed bound')
            if not page:return docs
    spec=json.loads(SPEC.read_text());source_hash=digest([p.read_text() for p in SOURCE_FILES])
    if args.mode=='plan':
        if any(directory.iterdir()):raise RuntimeError('Fresh directory required')
        inventory={'ingredients':listing('ingredients'),'kitchen_ingredients':listing(f'kitchens/{KITCHEN}/ingredients'),
                   'kitchen':request(BASE+f'/kitchens/{KITCHEN}')}
        (directory/'preimages.json').write_text(json.dumps(inventory,indent=2))
        plan=build_plan(inventory,spec,datetime.now(timezone.utc).isoformat().replace('+00:00','Z'))
        plan['source_hash']=source_hash
        (directory/'plan.json').write_text(json.dumps(plan,indent=2))
        print(json.dumps({'hash':digest(plan),'changes':len(plan['changes']),'issues':plan['issues']}));return
    plan=json.loads((directory/'plan.json').read_text())
    if plan['source_hash'] != source_hash:raise RuntimeError('Source changed; replan')
    rebuilt=build_plan(json.loads((directory/'preimages.json').read_text()),spec,plan['timestamp']);rebuilt['source_hash']=source_hash
    if rebuilt != plan:raise RuntimeError('Plan differs from protected source/preimages')
    validate_plan(plan)
    if args.mode=='apply':
        if args.confirm != digest(plan):raise RuntimeError('Exact confirmation hash required')
        op=args.export_operation or ''
        if not op.startswith(TARGET+'/operations/'):raise RuntimeError('Exact-target export required')
        export=request('https://firestore.googleapis.com/v1/'+op);meta=export.get('metadata',{})
        if not export.get('done') or export.get('error') or meta.get('outputUriPrefix','').rstrip('/') != BACKUP or 'ingredients' not in meta.get('collectionIds',[]):
            raise RuntimeError('Completed exact-scope managed export required')
        (directory/'managed-export.json').write_text(json.dumps(export,indent=2))
        print(json.dumps(apply_plan(request,plan)))
    report=verify_plan(request,plan)
    (directory/'verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
    if report['mismatches']:raise RuntimeError('Postimage mismatch')

if __name__=='__main__':run()
