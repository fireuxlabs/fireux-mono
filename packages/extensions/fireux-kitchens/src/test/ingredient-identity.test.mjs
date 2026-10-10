import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, exports, dependencies = {}) {
  const source = stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), 'utf8'))
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${source};return {${exports.join(',')}}`, Object.keys(dependencies))(...Object.values(dependencies))
}
const taxonomy = load('../runtime/ingredient/models/ingredient-taxonomy.ts', ['INGREDIENT_CATEGORIES', 'INGREDIENT_CATEGORY_OPTIONS'])
const migration = load('../runtime/ingredient/server/category-migration.ts', ['readIngredientCategory'], taxonomy)
const normalization = load('../runtime/ingredient/server/normalize.ts', ['normalizeIngredient', 'normalizeIngredientAliases', 'isActiveIngredient'], {
  ...migration, isFirestoreDocumentId: (id) => Boolean(id) && !id.includes('/'), IngredientDefaults: { created: {}, updated: {} },
})
const createError = (value) => Object.assign(new Error(value.statusMessage), value)
const input = load('../runtime/ingredient/server/curation-input.ts', ['CREATE_FIELDS','UPDATE_FIELDS','aliases','enumValue','foldIdentity','imageUrl','MAX_LIBRARY_SIZE','requiredName','text','validateObject'], { ...normalization, ...taxonomy, createError })
const storage = load('../runtime/ingredient/server/curation-storage.ts', ['canonicalStoredIngredient', 'assertUniqueActiveIngredientIdentity'], {...taxonomy, ...normalization, ...input, createError})
const stamp = { created: { at: 'created' }, updated: { at: 'updated' } }

 test('public ingredient identity contains only the simple contract', () => {
  const ingredient = normalization.normalizeIngredient({ id: 'carrot', data: () => ({ name:'Carrot', slug:'carrot', aliases:[], category:'vegetables', kind:'base', schema_version:3, parent_ingredient_id:'vegetables', status:'active', image_url:'' }) })
  assert.deepEqual(Object.keys(ingredient).sort(), ['id','name','slug','aliases','category','image_url','created','updated'].sort())
 })
 test('current writes require an explicit canonical category and allow missing images', () => {
  const result=storage.canonicalStoredIngredient('carrot',{}, {name:'Carrot',category:'vegetables',aliases:[]},stamp)
  assert.equal(result.category,'vegetables');assert.equal(result.image_url,'');assert.equal(result.schema_version,3)
  assert.throws(()=>storage.canonicalStoredIngredient('carrot',{}, {name:'Carrot',category:'produce'},stamp),/category/)
  assert.throws(()=>storage.canonicalStoredIngredient('carrot',{}, {name:'Carrot'},stamp),/category/)
 })
 test('client writes cannot change hierarchy, lifecycle, schema or supplier classification', () => {
  for (const field of ['kind','parent_ingredient_id','status','replaced_by_ingredient_id','schema_version','supplier_id','supplier_category'])
   assert.throws(()=>input.validateObject({[field]:'anything'},input.UPDATE_FIELDS,'Ingredient patch'),/unsupported/)
 })
 test('identity updates preserve stable slug and creation provenance', () => {
  const result=storage.canonicalStoredIngredient('carrot',{name:'Carrot',category:'vegetables',slug:'original-url',created:stamp.created},{name:'Fresh carrot'}, {updated:stamp.updated})
  assert.equal(result.slug,'original-url');assert.deepEqual(result.created,stamp.created)
  assert.equal('status' in result,false);assert.equal('kind' in result,false)
 })
 test('retired records stay unavailable independently of public identity fields', () => {
  assert.equal(normalization.isActiveIngredient({status:'merged'}),false)
  assert.equal(normalization.isActiveIngredient({status:'deprecated'}),false)
  assert.equal(normalization.isActiveIngredient({status:'unexpected'}),false)
  assert.equal(normalization.isActiveIngredient(undefined),false)
  assert.equal(normalization.isActiveIngredient({name:'Carrot'}),true)
 })
 test('aliases normalize and cannot conflict with another active identity even before category migration', async () => {
  assert.deepEqual(input.aliases([' Carrots ','carrots','Carrot'],'Carrot'),['Carrots'])
  const mutations={readAll: async()=>[{id:'existing',data:{name:'Carrot',category:'produce',status:'active'}}]}
  await assert.rejects(storage.assertUniqueActiveIngredientIdentity(mutations,{},'new',{name:'Other',aliases:['CARROT']}),/conflicts/)
 })
 test('fruit, prepared meat and fresh/dried herbs use explicit categories', () => {
  for (const [id,category] of [['pear','fruit'],['pineapple','fruit'],['smoked-bacon','meat-poultry'],['fresh-basil','herbs-spices'],['dried-basil','herbs-spices']])
   assert.equal(migration.readIngredientCategory(id,{category,schema_version:3}),category)
  assert.equal(new Set(taxonomy.INGREDIENT_CATEGORIES).size,13)
  assert.deepEqual(taxonomy.INGREDIENT_CATEGORY_OPTIONS.map(x=>x.value),taxonomy.INGREDIENT_CATEGORIES)
 })
 test('v2 read bridge keeps the directory usable until the backed-up migration is applied', () => {
  for (const [id,old,expected] of [['pear','produce','fruit'],['bacon','meat-poultry','meat-poultry'],['flour','pantry','grains-pasta-pulses'],['baked-beans','prepared','grains-pasta-pulses'],['olive-oil','pantry','oils-fats']])
   assert.equal(migration.readIngredientCategory(id,{category:old,schema_version:2}),expected)
  assert.equal(migration.readIngredientCategory('unknown',{category:'pantry',schema_version:3}),undefined)
 })
 test('Bären additions are canonical food inputs with explicit evidence or assumptions', () => {
  const spec=JSON.parse(readFileSync(new URL('../../../../../tools/misebox-migrations/ingredient-catalogue.json',import.meta.url),'utf8'))
  for (const row of spec.additions) {
   assert.ok(taxonomy.INGREDIENT_CATEGORIES.includes(row.category));assert.ok(row.basis)
   assert.equal('supplier_id' in row,false);assert.equal('price' in row,false)
  }
  for (const category of Object.values(spec.categories)) assert.ok(taxonomy.INGREDIENT_CATEGORIES.includes(category))
  assert.equal(new Set(spec.kitchen_ingredient_ids).size,spec.kitchen_ingredient_ids.length)
 })
