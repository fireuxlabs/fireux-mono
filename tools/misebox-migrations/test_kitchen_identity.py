import importlib.util, unittest
from copy import deepcopy
from pathlib import Path
spec=importlib.util.spec_from_file_location('migration',Path(__file__).with_name('kitchen-identity.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def fixture():
 return {'kitchens':[{'name':m.TARGET+'/documents/kitchens/p','updateTime':'v1','fields':{'slug':{'stringValue':'venue'},'status':{'stringValue':'active'},'visibility':{'booleanValue':True},'currency':{'stringValue':'CHF'},'orders':{'mapValue':{'fields':{'unchanged':{'booleanValue':True}}}}}}], 'places':[{'name':m.TARGET+'/documents/places/p','updateTime':'v1','fields':{'default_currency_code':{'stringValue':'CHF'}}}]}
class KitchenIdentityTests(unittest.TestCase):
 def test_additive_exact_preservation(self):
  i=fixture();before=deepcopy(i);p=m.build_plan(i);c=p['changes'][0]
  self.assertEqual(i,before);self.assertEqual(c['changed'],['identity']);self.assertFalse(p['retirement'])
  self.assertEqual({k:v for k,v in c['after'].items() if k!='identity'},c['before'])
  self.assertNotIn('source',c['after']['identity']['mapValue']['fields']);self.assertEqual(len(p['unknown_origin']),1)
 def test_known_origin_and_idempotence(self):
  i=fixture();i['kitchens'][0]['fields']['identity_source']={'stringValue':'user'};p=m.build_plan(i)
  self.assertEqual(p['changes'][0]['after']['identity']['mapValue']['fields']['source'],{'stringValue':'user'})
  i['kitchens'][0]['fields']=p['changes'][0]['after'];self.assertEqual(m.build_plan(i)['changes'],[])
 def test_conflicts_block(self):
  for kind in ['currency','identity','source','place','target']:
   i=fixture()
   if kind=='currency':i['places'][0]['fields']['default_currency_code']={'stringValue':'GBP'}
   if kind=='identity':i['kitchens'][0]['fields']['identity']={'mapValue':{'fields':{}}}
   if kind=='source':i['kitchens'][0]['fields']['identity_source']={'stringValue':'guessed'}
   if kind=='place':i['places']=[]
   if kind=='target':i['kitchens'][0]['name']=i['kitchens'][0]['name'].replace('misebox-78f9c','another-project')
   with self.subTest(kind=kind),self.assertRaises(ValueError):m.build_plan(i)
if __name__=='__main__':unittest.main()
