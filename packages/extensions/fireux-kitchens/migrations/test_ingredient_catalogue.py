import copy
import importlib.util
from pathlib import Path
import unittest
import urllib.error

spec=importlib.util.spec_from_file_location('ingredient_catalogue',Path(__file__).with_name('ingredient-catalogue.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class IngredientMigrationTests(unittest.TestCase):
 def setUp(self):
  self.root={'name':m.TARGET+'/documents/ingredients/carrot','updateTime':'v1','fields':{'name':m.string('Carrot'),'category':m.string('produce'),'kind':m.string('base'),'status':m.string('active'),'created':{'mapValue':{'fields':{}}},'other':m.string('preserve')}}
  self.inventory={'ingredients':[self.root],'kitchen_ingredients':[],'kitchen':{'name':m.TARGET+'/documents/kitchens/'+m.KITCHEN}}
  self.spec={'kitchen_id':m.KITCHEN,'categories':{'carrot':'vegetables'},'additions':[{'id':'pumpkin','name':'Pumpkin','aliases':[],'category':'vegetables'}],'kitchen_ingredient_ids':['carrot','pumpkin']}
 def plan(self):return m.build_plan(self.inventory,self.spec,'2026-09-18T00:00:00Z')
 def test_preserves_identity_and_metadata(self):
  p=self.plan();m.validate_plan(p);self.assertEqual(p['issues'],[]);self.assertEqual(len(p['changes']),4)
  c=p['changes'][0]
  for k in ['kind','status','created','other','name']:self.assertEqual(c['before'][k],c['after'][k])
  self.assertEqual(c['after']['category'],m.string('vegetables'))
 def test_existing_alias_blocks_duplicate_seed(self):
  self.root['fields']['aliases']={'arrayValue':{'values':[m.string('Pumpkin')]}}
  self.assertTrue(self.plan()['issues'])
 def test_unreviewed_identity_blocks_apply(self):
  self.spec['categories']={};p=self.plan();self.assertTrue(p['issues'])
  with self.assertRaises(ValueError):m.validate_plan(p)
 def test_retired_identity_never_reactivated_or_linked(self):
  self.root['fields']['status']=m.string('merged');p=self.plan()
  self.assertEqual(p['changes'][0]['after']['status'],m.string('merged'));self.assertTrue(p['issues'])
 def test_preserves_existing_link_with_different_id(self):
  self.inventory['kitchen_ingredients']=[{'name':m.TARGET+'/documents/kitchens/'+m.KITCHEN+'/ingredients/existing','fields':{'ingredient_id':m.string('carrot')}}]
  self.assertEqual(len(self.plan()['changes']),3)
 def test_conflicting_link_blocks_plan(self):
  self.inventory['kitchen_ingredients']=[{'name':m.TARGET+'/documents/kitchens/'+m.KITCHEN+'/ingredients/carrot','fields':{'ingredient_id':m.string('another')}}]
  self.assertTrue(self.plan()['issues'])
 def test_scope_and_destructive_changes_rejected(self):
  p=self.plan();p['changes'][0]['name']=m.TARGET+'/documents/kitchens/another'
  with self.assertRaises(ValueError):m.validate_plan(p)
  p=self.plan();p['changes'][0]['changed'].append('kind')
  with self.assertRaises(ValueError):m.validate_plan(p)
 def test_atomic_commit_preconditions_and_replay(self):
  p=self.plan();docs={self.root['name']:copy.deepcopy(self.root)};commits=[]
  def request(url,data=None):
   if data is not None:
    commits.append(data)
    for w in data['writes']:
     n=w['update']['name'];fields=docs.get(n,{}).get('fields',{})|w['update']['fields'];docs[n]={'name':n,'fields':fields,'updateTime':'v2'}
    return {}
   n=url.removeprefix('https://firestore.googleapis.com/v1/')
   if n not in docs:raise urllib.error.HTTPError(url,404,'missing',{},None)
   return docs[n]
  self.assertEqual(m.apply_plan(request,p)['applied'],4);self.assertEqual(len(commits),1)
  self.assertEqual(commits[0]['writes'][0]['currentDocument'],{'updateTime':'v1'})
  self.assertEqual(commits[0]['writes'][1]['currentDocument'],{'exists':False})
  self.assertEqual(m.apply_plan(request,p)['applied'],0)
  self.assertEqual(m.verify_plan(request,p)['mismatches'],[])
 def test_firestore_empty_array_encoding_is_equivalent_not_a_data_mismatch(self):
  p=self.plan();docs={c['name']:{'fields':copy.deepcopy(c['after'])} for c in p['changes']}
  for d in docs.values():
   if d['fields'].get('aliases')=={'arrayValue':{'values':[]}}:d['fields']['aliases']={'arrayValue':{}}
  def request(url,data=None):
   self.assertIsNone(data);return docs[url.removeprefix('https://firestore.googleapis.com/v1/')]
  self.assertEqual(m.verify_plan(request,p)['mismatches'],[])
  self.assertEqual(m.apply_plan(request,p)['applied'],0)
  docs[p['changes'][1]['name']]['fields']['aliases']={'arrayValue':{'values':[m.string('different')]}}
  self.assertEqual(len(m.verify_plan(request,p)['mismatches']),1)
 def test_stale_preimage_blocks_entire_commit(self):
  p=self.plan()
  def request(url,data=None):
   self.assertIsNone(data);return {**self.root,'updateTime':'new'}
  with self.assertRaises(RuntimeError):m.apply_plan(request,p)
 def test_replanning_is_noop(self):
  p=self.plan();i=copy.deepcopy(self.inventory);i['ingredients']=[]
  for c in p['changes']:
   d={'name':c['name'],'fields':c['after'],'updateTime':'v2'}
   i['kitchen_ingredients' if '/kitchens/' in c['name'] else 'ingredients'].append(d)
  self.assertEqual(m.build_plan(i,self.spec,'later')['changes'],[])

if __name__=='__main__':unittest.main()
