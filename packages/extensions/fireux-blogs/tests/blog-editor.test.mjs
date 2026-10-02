import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'

const load = async (path, replacements = []) => {
  let source = stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), 'utf8'))
  for (const [from, to] of replacements) source = source.replace(from, to)
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}
const reviewSource = stripTypeScriptTypes(readFileSync(new URL('../src/runtime/utils/editorial-review.ts', import.meta.url), 'utf8'))
const reviewUrl = `data:text/javascript;base64,${Buffer.from(reviewSource).toString('base64')}`
const { buildBlogEditorialUpdate } = await load('../src/runtime/utils/blog-editor.ts', [["'./editorial-review'", JSON.stringify(reviewUrl)]])
const review = { source_kind: 'ai-assisted', privacy_reviewed: true, facts_reviewed: true, names_approved: true }
const fields = { title: 'Updated article', content: '<p>Verified content.</p>', metaDescription: 'Updated description' }
const original = { id: 'original', slug: 'original', author: { id: 'author' }, created: { at: 1 }, canonicalUrl: 'https://example.com/blog/original', visibility: 'public', publication_scope: 'ecosystem', source_app_id: 'app', featuredImage: 'image', sproochli: { translations: { de: { status: 'approved' } } } }
test('prose update preserves identity, publication, media and translations by excluding them', () => {
  const before = structuredClone(original)
  const update = buildBlogEditorialUpdate(original, { ...fields, slug: 'changed', author: {} }, review)
  assert.deepEqual(Object.keys(update).sort(), ['title', 'content', 'metaDescription', 'readingTime', 'editorial_review'].sort())
  assert.deepEqual(original, before)
  assert.equal(update.readingTime, '1 min')
  assert.notEqual(update.editorial_review, review)
})
test('each fresh editorial approval is required', () => {
  for (const key of ['privacy_reviewed', 'facts_reviewed', 'names_approved']) {
    assert.throws(() => buildBlogEditorialUpdate(original, fields, { ...review, [key]: false }))
  }
})
test('private material and empty prose cannot be saved', () => {
  assert.throws(() => buildBlogEditorialUpdate(original, { ...fields, content: '<p>private@example.com</p>' }, review), /email/)
  assert.throws(() => buildBlogEditorialUpdate(original, { ...fields, content: '<p> </p>' }, review), /content/)
  assert.throws(() => buildBlogEditorialUpdate(original, { ...fields, title: ' ' }, review), /title/)
})
test('projection limits are checked before a write', () => {
  assert.throws(() => buildBlogEditorialUpdate(original, { ...fields, title: 'a'.repeat(241) }, review), /length/)
  assert.throws(() => buildBlogEditorialUpdate(original, { ...fields, content: 'a'.repeat(200001) }, review), /length/)
})
