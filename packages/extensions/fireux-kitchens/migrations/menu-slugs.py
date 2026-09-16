"""Backfill explicit Menu slugs without moving IDs or touching child records."""
import argparse, hashlib, json, os, subprocess, urllib.request
from pathlib import Path
TARGET = 'projects/misebox-78f9c/databases/misebox'
FOOD = TARGET + '/documents/kitchens/ChIJ08WSgYSjj0cRD6oE3RwUFk0/menus/food'
def digest(value): return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def build_plan(inventory):
    changes, seen = [], set()
    for document in inventory['menus']:
        name = document['name']
        if not name.startswith(TARGET + '/documents/kitchens/') or len(name.split('/documents/')[1].split('/')) != 4: raise ValueError('Unexpected Menu target')
        current = document.get('fields', {})
        # The only renamed URL in this cutover. Other existing URLs remain exact.
        slug = 'comida-casera' if name == FOOD else name.split('/')[-1]
        if name == FOOD and current.get('name', {}).get('stringValue') != 'Comida Casera': raise ValueError('La Tapberne name changed; review before migration')
        key = (name.rsplit('/', 1)[0], slug)
        if key in seen: raise ValueError('Duplicate slug: ' + slug)
        seen.add(key)
        if current.get('slug') == {'stringValue': slug}: continue
        if 'slug' in current: raise ValueError('Existing slug differs; review ' + name)
        changes.append({'name': name, 'before': current, 'after': {**current, 'slug': {'stringValue': slug}}, 'updateTime': document['updateTime'], 'slug': slug})
    return {'target': TARGET, 'changes': changes}
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['plan','apply'])
    parser.add_argument('--directory', required=True)
    parser.add_argument('--inventory')
    parser.add_argument('--confirm')
    parser.add_argument('--export-operation')
    args=parser.parse_args(); os.umask(0o077)
    directory=Path(args.directory);directory.mkdir(parents=True,exist_ok=True,mode=0o700)
    path=directory/'plan.json';source_hash=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    if args.mode=='plan':
        if path.exists():raise ValueError('Use a fresh protected directory')
        inventory=json.loads(Path(args.inventory).read_text());plan=build_plan(inventory);plan['source_hash']=source_hash
        (directory/'preimages.json').write_text(json.dumps(inventory,indent=2));path.write_text(json.dumps(plan,indent=2))
        print(json.dumps({'changes':len(plan['changes']),'hash':digest(plan),'changed_url':'comida-casera'}));return
    plan=json.loads(path.read_text())
    if plan['target']!=TARGET or plan['source_hash']!=source_hash or args.confirm!=digest(plan):raise ValueError('Plan/source confirmation mismatch')
    token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
    def request(url,body=None):
        req=urllib.request.Request('https://firestore.googleapis.com/v1/'+url,data=None if body is None else json.dumps(body).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
        with urllib.request.urlopen(req) as response:return json.load(response)
    if not args.export_operation or not args.export_operation.startswith(TARGET+'/operations/'):raise ValueError('Exact-target export required')
    export=request(args.export_operation)
    if not export.get('done') or export.get('error') or 'menus' not in export.get('metadata',{}).get('collectionIds',[]):raise ValueError('Completed Menu backup required')
    (directory/'managed-export.json').write_text(json.dumps(export,indent=2))
    writes=[]
    for change in plan['changes']:
        current=request(change['name'])
        if current.get('fields')==change['after']:continue
        if current['updateTime']!=change['updateTime'] or current.get('fields')!=change['before']:raise ValueError('Record changed: '+change['name'])
        writes.append({'update':{'name':change['name'],'fields':{'slug':{'stringValue':change['slug']}}},'updateMask':{'fieldPaths':['slug']},'currentDocument':{'updateTime':change['updateTime']}})
    if len(writes)>450:raise ValueError('Too many changes')
    if writes:request(TARGET+'/documents:commit',{'writes':writes})
    mismatches=[c['name'] for c in plan['changes'] if request(c['name']).get('fields')!=c['after']]
    report={'applied':len(writes),'verified':len(plan['changes'])-len(mismatches),'mismatches':mismatches}
    (directory/'verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
    if mismatches:raise ValueError('Verification failed')
if __name__=='__main__':main()
