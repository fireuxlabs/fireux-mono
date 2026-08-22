// @fireux-script
// last_used: 2026-07-23
// usage_note: run through pnpm guard; protects canonical Blog directory/detail reads and feed-reference boundaries.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const model = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts'
  )
  const projection = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/server/blog/read.ts'
  )
  const directoryModel = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/models/blog-directory.model.ts'
  )
  const directoryEndpoint = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/server/api/blogs/index.get.ts'
  )
  const manager = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/components/Blog/Collection/Manager.vue'
  )
  const editorialManager = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/components/Blog/Collection/EditorialManager.vue'
  )
  const directoryCollection = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/directory/useBlogDirectory.ts'
  )
  const blogLanguage = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/directory/useBlogLanguage.ts'
  )
  const index = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue'
  )
  const editorialIndex = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/components/Blog/Index.vue'
  )
  const adminIndex = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/pages/dashboard/admin/blogs/index.vue'
  )
  const devIndex = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/pages/dev/fireux-blogs.vue'
  )
  const detail = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/pages/blog/[slug].vue'
  )
  const images = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/components/Blog/Create/Images.vue'
  )
  const localPublisher = read(repoRoot, 'scripts/publish-fireux-blog.mjs')
  const createWriter = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogCreate.ts'
  )

  for (const token of [
    'source_app_id',
    "visibility: 'app'",
    "publication_scope: 'app'",
    'BlogPostFeedReference',
    "kind: 'blog-post'",
    'BlogPostSproochliAttachment',
    'BlogEditorialReview',
    'privacy_reviewed: false',
    'sproochli: undefined',
  ]) {
    assert.ok(model.includes(token), `Blog root model must retain ${token}.`)
  }
  for (const retiredField of [
    'source_ecosystem_id',
    'owner_type',
    'owner_id',
    'email?: string',
  ]) {
    assert.ok(
      !model.includes(retiredField),
      `Blog root model must not retain redundant/private field ${retiredField}.`
    )
  }
  for (const source of [createWriter, localPublisher]) {
    assert.doesNotMatch(
      source,
      /\b(?:source_ecosystem_id|owner_type|owner_id)\b/,
      'Blog writers must not restore redundant ecosystem or generic owner scope.'
    )
  }
  assert.doesNotMatch(localPublisher, /\bid:\s*slug\b/)
  for (const token of [
    "data.visibility !== 'public'",
    'isFirestoreDocumentId(sourceAppId)',
    'httpsUrl(data.featuredImage)',
    'httpsUrl(data.socialImage)',
    "translation.status !== 'approved'",
    'available_languages',
  ]) {
    assert.ok(
      projection.includes(token),
      `Blog projection must retain ${token}.`
    )
  }
  assert.doesNotMatch(
    projection,
    /sourceAppId\s*===\s*scope\.tenantAppId|publication_scope\s*===\s*['"]ecosystem['"]/,
    'Blog routes must aggregate every published post in the runtime ecosystem.'
  )
  assert.match(manager, /useBlogCollection/)
  assert.doesNotMatch(manager, /useBlogDirectory/)
  assert.match(editorialManager, /useBlogDirectory/)
  assert.doesNotMatch(editorialManager, /useBlogCollection/)
  assert.match(directoryCollection, /nextCursor/)
  assert.match(directoryCollection, /loadMore/)
  assert.match(directoryCollection, /blogLanguage\.query\.value/)
  assert.match(directoryCollection, /watch: \[blogLanguage\.language\]/)
  assert.match(blogLanguage, /selectionCookie/)
  assert.match(blogLanguage, /queryParameter/)
  assert.match(directoryModel, /BlogDirectoryEntry/)
  assert.match(directoryModel, /'content'/)
  assert.match(projection, /const \{ content, \.\.\.indexPost \} = post/)
  assert.match(directoryEndpoint, /projectBlogDirectoryEntry/)
  assert.doesNotMatch(directoryEndpoint, /projectBlogDetail\(/)
  assert.match(index, /<BlogIndex\s*\/>/)
  assert.doesNotMatch(index, /BlogCollectionManager/)
  assert.match(editorialIndex, /<BlogCollectionEditorialManager\s*\/>/)
  assert.doesNotMatch(editorialIndex, /BlogCollectionManager/)
  assert.match(adminIndex, /<BlogCollectionManager\s*\/>/)
  assert.match(devIndex, /<BlogCollectionManager\s*\/>/)
  assert.match(detail, /useBlogDetail/)
  assert.match(detail, /Blog detail \(JSON\)/)
  assert.doesNotMatch(detail, /fetchBySlug|useBlog\(/)
  assert.match(images, /`blogs\/\$\{blogId\}\/featured\.jpg`/)
  assert.match(images, /`blogs\/\$\{blogId\}\/social\.jpg`/)

  const createSubmit = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/editor/useBlogCreateSubmit.ts'
  )
  const editorialReview = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/utils/editorial-review.ts'
  )
  assert.match(createSubmit, /assertBlogEditorialApproval\(payload\)/)
  for (const token of [
    'privacy_reviewed',
    'facts_reviewed',
    'names_approved',
  ]) {
    assert.ok(
      editorialReview.includes(token),
      `Blog editorial review must retain ${token}.`
    )
  }
  for (const token of [
    "lane: 'mcp-skill'",
    "verbs: updateMode ? ['update'] : ['create']",
    'databaseId: DATABASE_ID',
    'mcpSkillCreate(app, target',
    'mcpSkillUpdate(app, target',
    'assertBlogEditorialApproval(entry.post)',
    'plan_sha256',
    'featured_image_sha256',
    '--confirm=',
    "snapshot.data()?.visibility !== 'public'",
  ]) {
    assert.ok(
      localPublisher.includes(token),
      `Local Blog publishing must retain ${token}.`
    )
  }
}
