import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireAdmin } from 'fireux-core/runtime/app/server/app-user/command-contract'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { APP_MUTATION_TARGETS, serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validate-public-slug'
import type { BlogPostCreateInput } from '../utils/blog-post'
import { normalizeBlogPost, normalizeBlogPostCreate, normalizeBlogPostUpdate } from '../utils/normalize-blog-post'
import { buildBlogEditorialUpdate } from '../utils/blog-editor'
import { assertBlogEditorialApproval } from '../utils/editorial-review'

const blogs = defineFirestoreMutationTarget({ key: 'blogs.authoring', lane: 'server', verbs: ['create', 'update'], database: { kind: 'runtime' }, collectionPath: 'blogs' })
function slugId(value: unknown) {
  const validation = validatePublicSlug(String(value ?? ''), { label: 'Blog post slug', namespace: 'blog', reservedScope: 'entity' })
  if (!validation.isValid) throw createError({ statusCode: 400, statusMessage: validation.message || 'Blog post slug is invalid.' })
  return validation.slug
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw createError({ statusCode: 400, statusMessage: 'Blog input must be an object.' })
  return value as Record<string, unknown>
}
/** Authoring uses the current App's admin membership in the writing transaction. */
async function author(event: H3Event, slug: string, change: (data: Record<string, unknown> | undefined) => { create?: Record<string, unknown>; update?: Record<string, unknown> }) {
  const appId = requireFirestoreDocumentId(useFireUXConfig(event).appId, 'App id')
  const { uid } = await requireFirebaseBearerUser(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    const [app, member, record] = await Promise.all([
      tx.read(APP_MUTATION_TARGETS.runtimeApps, appId),
      tx.read(serverAppUsersTarget(appId), uid),
      tx.read(blogs, slug),
    ])
    if (!app.exists) throw createError({ statusCode: 404, statusMessage: 'App not found.' })
    requireAdmin(member.data)
    if (record.exists && record.data?.source_app_id !== appId) throw createError({ statusCode: 403, statusMessage: 'This post belongs to another App.' })
    const next = change(record.data)
    const stamp = serverAuditStamp({ by: uid, appId })
    if (next.create) tx.create(blogs, slug, { ...next.create, source_app_id: appId, created: stamp, updated: stamp })
    if (next.update) tx.update(blogs, slug, { ...next.update, updated: stamp })
    return { ok: true as const, appId, slug }
  })
}
export function createBlogPost(event: H3Event, input: unknown) {
  const source = object(input), slug = slugId(source.slug)
  const normalized = normalizeBlogPostCreate({ ...source, slug } as BlogPostCreateInput)
  assertBlogEditorialApproval(normalized)
  buildBlogEditorialUpdate(normalizeBlogPost(slug, normalized)!, normalized, normalized.editorial_review)
  const data = JSON.parse(JSON.stringify(normalized)) as Record<string, unknown>
  // Creation remains a private draft; publication is a separate reviewed command.
  data.visibility = 'app'
  return author(event, slug, existing => {
    if (existing) throw createError({ statusCode: 409, statusMessage: 'This Blog slug is already in use.' })
    return { create: data }
  })
}
export function updateBlogPost(event: H3Event, id: unknown, input: unknown) {
  const slug = slugId(id), source = object(input)
  if (source.slug !== undefined && source.slug !== slug) throw createError({ statusCode: 400, statusMessage: 'Blog post slug cannot change.' })
  const changes = normalizeBlogPostUpdate(source)
  return author(event, slug, existing => {
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Blog post not found.' })
    const post = normalizeBlogPost(slug, { ...existing, ...changes })!
    assertBlogEditorialApproval(post)
    buildBlogEditorialUpdate(post, post, post.editorial_review)
    return { update: JSON.parse(JSON.stringify(changes)) as Record<string, unknown> }
  })
}
export function publishBlogPost(event: H3Event, id: unknown, input: unknown) {
  const slug = slugId(id), source = object(input)
  if (source.publicationScope !== undefined && !['app', 'ecosystem'].includes(String(source.publicationScope))) throw createError({ statusCode: 400, statusMessage: 'Blog publication scope is invalid.' })
  return author(event, slug, existing => {
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Blog post not found.' })
    const post = normalizeBlogPost(slug, existing)!
    assertBlogEditorialApproval(post)
    buildBlogEditorialUpdate(post, post, post.editorial_review)
    return { update: { visibility: 'public', publication_scope: source.publicationScope || 'app' } }
  })
}
