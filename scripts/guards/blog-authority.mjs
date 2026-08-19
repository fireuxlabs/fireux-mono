// @fireux-script
// last_used: 2026-07-23
// usage_note: run through pnpm guard; protects canonical Blog public projection and feed-reference boundaries.

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
    'packages/extensions/fireux-blogs/src/runtime/server/utils/blog/public-projection.ts'
  )
  const publicModel = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/models/blogPost-public.model.ts'
  )
  const publicIndexEndpoint = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/server/api/public/blogs.get.ts'
  )
  const manager = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/components/Blog/Collection/Manager.vue'
  )
  const editorialManager = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/components/Blog/Collection/EditorialManager.vue'
  )
  const publicCollection = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/public/usePublicBlogCollection.ts'
  )
  const publicLanguage = read(
    repoRoot,
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/public/usePublicBlogLanguage.ts'
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

  for (const token of [
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
  for (const token of [
    "data.visibility !== 'public'",
    'source_ecosystem_id',
    'isFirestoreDocumentId(sourceAppId)',
    'httpsUrl(data.featuredImage)',
    'httpsUrl(data.socialImage)',
    "translation.status !== 'approved'",
    'available_languages',
  ]) {
    assert.ok(projection.includes(token), `Blog projection must retain ${token}.`)
  }
  assert.doesNotMatch(
    projection,
    /sourceAppId\s*===\s*scope\.tenantAppId|publication_scope\s*===\s*['"]ecosystem['"]/,
    'Public Blog routes must aggregate every public post in the runtime ecosystem.'
  )
  assert.match(manager, /useBlogCollection/)
  assert.doesNotMatch(manager, /usePublicBlogCollection/)
  assert.match(editorialManager, /usePublicBlogCollection/)
  assert.doesNotMatch(editorialManager, /useBlogCollection/)
  assert.match(publicCollection, /nextCursor/)
  assert.match(publicCollection, /loadMore/)
  assert.match(publicCollection, /blogLanguage\.query\.value/)
  assert.match(publicCollection, /watch: \[blogLanguage\.language\]/)
  assert.match(publicLanguage, /selectionCookie/)
  assert.match(publicLanguage, /queryParameter/)
  assert.match(publicModel, /PublicBlogPostIndexProjection/)
  assert.match(publicModel, /'content'/)
  assert.match(projection, /const \{ content, \.\.\.indexPost \} = post/)
  assert.match(publicIndexEndpoint, /projectPublicBlogIndexPost/)
  assert.doesNotMatch(publicIndexEndpoint, /projectPublicBlogPost\(/)
  assert.match(index, /<BlogIndex\s*\/>/)
  assert.doesNotMatch(index, /BlogCollectionManager/)
  assert.match(editorialIndex, /<BlogCollectionEditorialManager\s*\/>/)
  assert.doesNotMatch(editorialIndex, /BlogCollectionManager/)
  assert.match(adminIndex, /<BlogCollectionManager\s*\/>/)
  assert.match(devIndex, /<BlogCollectionManager\s*\/>/)
  assert.match(detail, /usePublicBlogFetch/)
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
  for (const token of ['privacy_reviewed', 'facts_reviewed', 'names_approved']) {
    assert.ok(editorialReview.includes(token), `Blog editorial review must retain ${token}.`)
  }
  for (const token of [
    "lane: 'mcp-skill'",
    "verbs: updateMode ? ['update'] : ['create']",
    "databaseId: DATABASE_ID",
    'mcpSkillCreate(app, target',
    'mcpSkillUpdate(app, target',
    'assertBlogEditorialApproval(entry.post)',
    'plan_sha256',
    'featured_image_sha256',
    '--confirm=',
    "snapshot.data()?.visibility !== 'public'",
  ]) {
    assert.ok(localPublisher.includes(token), `Local Blog publishing must retain ${token}.`)
  }
}
