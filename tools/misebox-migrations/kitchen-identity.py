"""Exact-target, additive Kitchen Identity copy. No retirement or record deletion."""
import argparse,hashlib,json,os,re,subprocess,urllib.parse
from pathlib import Path
TARGET='projects/misebox-78f9c/databases/misebox'
EXPORT='gs://misebox-78f9c-firestore-migrations/place-kitchen-identity-20261005'
def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def string(value):return value.get('stringValue','') if isinstance(value,dict) else ''
def build_plan(inventory):
 places={p['name']:p for p in inventory['places']};changes=[];origins=[];slugs=set()
 for doc in inventory['kitchens']:
  name=doc['name'];path=name.removeprefix(TARGET+'/documents/')
  if not name.startswith(TARGET+'/documents/') or len(path.split('/'))!=2 or not path.startswith('kitchens/'):raise ValueError('Unexpected Kitchen target')
  before=doc.get('fields',{});place_name=TARGET+'/documents/places/'+path.split('/')[-1];place=places.get(place_name)
  if not place:raise ValueError('Linked Place missing: '+path)
  old={k:before.get(k) for k in ['slug','status','visibility']}
  slug=string(old['slug'])
  if not slug or slug in slugs or string(old['status']) not in ['active','inactive','archived'] or not isinstance(old['visibility'],dict) or type(old['visibility'].get('booleanValue')) is not bool:raise ValueError('Invalid or duplicate Identity: '+path)
  slugs.add(slug)
  source=string(before.get('identity_source'))
  if 'identity_source' in before and source not in ['user','place']:raise ValueError('Invalid source: '+path)
  if source:old['source']={'stringValue':source}
  else:origins.append(path)
  identity={'mapValue':{'fields':old}}
  if 'identity' in before and before['identity']!=identity:raise ValueError('Conflicting nested Identity: '+path)
  kc=string(before.get('currency')).strip().upper();pc=string(place.get('fields',{}).get('default_currency_code')).strip().upper()
  for code in [kc,pc]:
   if code and not re.fullmatch('[A-Z]{3}',code):raise ValueError('Invalid currency: '+path)
  if kc and kc!=pc:raise ValueError('Place currency does not preserve trading currency: '+path)
  after={**before,'identity':identity}
  if after!=before:changes.append({'name':name,'updateTime':doc['updateTime'],'before':before,'after':after,'changed':['identity']})
 return {'target':TARGET,'changes':changes,'dependencies':inventory['places'],'unknown_origin':origins,'retirement':False}
class Client:
 def __init__(self):self.token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True,stderr=subprocess.DEVNULL).strip()
 def request(self,path,body=None):
  cmd=['curl','--silent','--show-error','--max-time','45','--header','@-','--url','https://firestore.googleapis.com/v1/'+path]
  headers='Authorization: Bearer '+self.token+'\n'
  if body is not None:cmd+=['--request','POST','--data-binary',json.dumps(body)];headers+='Content-Type: application/json\n'
  r=subprocess.run(cmd,input=headers,text=True,capture_output=True,check=True);value=json.loads(r.stdout)
  if isinstance(value,dict) and 'error' in value:raise RuntimeError('Firestore request failed: '+str(value['error'].get('code')))
  return value
 def listing(self):
  docs=[];page=''
  while True:
   result=self.request(TARGET+'/documents/kitchens?pageSize=300'+('&pageToken='+urllib.parse.quote(page,safe='') if page else ''));docs+=result.get('documents',[]);page=result.get('nextPageToken','')
   if not page:return docs
 def document(self,name,transaction=''):return self.request(name+('?transaction='+urllib.parse.quote(transaction,safe='') if transaction else ''))
def main():
 parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['plan','apply','verify']);parser.add_argument('--directory',required=True);parser.add_argument('--confirm');parser.add_argument('--export-operation');args=parser.parse_args()
 os.umask(0o077);directory=Path(args.directory);directory.mkdir(mode=0o700,parents=True,exist_ok=True)
 if directory.stat().st_mode&0o077:raise ValueError('Protected directory must be mode 0700')
 source_hash=hashlib.sha256(Path(__file__).read_bytes()).hexdigest();plan_path=directory/'plan.json';client=Client()
 if args.mode=='plan':
  if plan_path.exists():raise ValueError('Use a fresh plan directory')
  roots=client.listing();places=[client.document(TARGET+'/documents/places/'+urllib.parse.quote(k['name'].rsplit('/',1)[-1],safe='')) for k in roots];inventory={'kitchens':roots,'places':places}
  plan=build_plan(inventory);plan['source_hash']=source_hash
  (directory/'preimages.json').write_text(json.dumps(inventory,indent=2));plan_path.write_text(json.dumps(plan,indent=2))
  print(json.dumps({'hash':digest(plan),'changes':len(plan['changes']),'unknown_origin':len(plan['unknown_origin']),'retirement':False}));return
 plan=json.loads(plan_path.read_text());inventory=json.loads((directory/'preimages.json').read_text())
 rebuilt=build_plan(inventory);rebuilt['source_hash']=source_hash
 if rebuilt!=plan or plan['target']!=TARGET:raise ValueError('Source or protected plan changed')
 if args.mode=='apply':
  if args.confirm!=digest(plan):raise ValueError('Exact reviewed plan hash required')
  operation=args.export_operation or ''
  if not operation.startswith(TARGET+'/operations/'):raise ValueError('Exact-target export required')
  export=client.request(operation);metadata=export.get('metadata',{})
  if not export.get('done') or export.get('error') or not {'kitchens','places'}.issubset(metadata.get('collectionIds',[])) or metadata.get('outputUriPrefix')!=EXPORT:raise ValueError('Completed scoped backup required')
  (directory/'managed-export.json').write_text(json.dumps(export,indent=2))
  transaction=client.request(TARGET+'/documents:beginTransaction',{'options':{'readWrite':{}}})['transaction'];writes=[]
  try:
   for dependency in plan['dependencies']:
    current=client.document(dependency['name'],transaction)
    if current.get('fields',{})!=dependency.get('fields',{}) or current['updateTime']!=dependency['updateTime']:raise ValueError('Place changed since plan')
   for change in plan['changes']:
    current=client.document(change['name'],transaction)
    if current.get('fields',{})==change['after']:continue
    if current['updateTime']!=change['updateTime'] or current.get('fields',{})!=change['before']:raise ValueError('Kitchen changed since plan')
    writes.append({'update':{'name':change['name'],'fields':{'identity':change['after']['identity']}},'updateMask':{'fieldPaths':['identity']},'currentDocument':{'updateTime':change['updateTime']}})
   if len(writes)>450:raise ValueError('Too many writes')
   client.request(TARGET+'/documents:commit',{'transaction':transaction,'writes':writes})
  except BaseException:
   client.request(TARGET+'/documents:rollback',{'transaction':transaction});raise
  print(json.dumps({'applied':len(writes),'retirement':False}))
 mismatches=[c['name'] for c in plan['changes'] if client.document(c['name']).get('fields',{})!=c['after']]
 report={'verified':len(plan['changes'])-len(mismatches),'mismatches':mismatches,'place_records_unchanged':all(client.document(p['name']).get('fields',{})==p.get('fields',{}) for p in plan['dependencies'])}
 (directory/'verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
 if mismatches or not report['place_records_unchanged']:raise ValueError('Verification failed')
if __name__=='__main__':main()
