#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-19
// usage_note: plan and create reviewed FireUX Blog posts through the typed MCP/Skill mutation lane.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'
import {
  assertBlogEditorialApproval,
  reviewBlogEditorialContent,
} from '../packages/extensions/fireux-blogs/src/runtime/utils/editorial-review.ts'

const PROJECT_ID = 'fireux-2005'
const DATABASE_ID = 'fireux'
const COLLECTION_ID = 'blogs'
const APP_ID = 'fireux-app'
const ECOSYSTEM_ID = 'fireux'
const ACTOR = 'system:local-blog-publisher'
const PUBLIC_ORIGIN = 'https://fireux.app'

const args = Object.fromEntries(process.argv.slice(2).map((token) => {
  const [key, ...rest] = token.replace(/^--/, '').split('=')
  return [key, rest.length ? rest.join('=') : true]
}))
const text = value => String(value ?? '').trim()
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const escapeHtml = value => text(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error(`${filePath}: expected YAML frontmatter.`)
  const metadata = {}
  let activeList = ''
  for (const rawLine of match[1].split(/\r?\n/)) {
    const listItem = rawLine.match(/^\s+-\s+(.+)$/)
    if (listItem && activeList) {
      metadata[activeList].push(listItem[1].trim())
      continue
    }
    const field = rawLine.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/)
    if (!field) continue
    const [, key, value] = field
    if (!value) {
      metadata[key] = []
      activeList = key
    } else {
      metadata[key] = value.trim()
      activeList = ''
    }
  }
  return { metadata, markdown: match[2].trim() }
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g, '<a href="$2">$1</a>')
}

function markdownToHtml(markdown) {
  const output = []
  let paragraph = []
  let list = ''
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`)
    paragraph = []
  }
  const closeList = () => {
    if (list) output.push(`</${list}>`)
    list = ''
  }
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      closeList()
      continue
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    const quote = line.match(/^>\s+(.+)$/)
    const bullet = line.match(/^[-*]\s+(.+)$/)
    const ordered = line.match(/^\d+\.\s+(.+)$/)
    if (heading) {
      flushParagraph(); closeList()
      const level = heading[1].length
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`)
    } else if (quote) {
      flushParagraph(); closeList()
      output.push(`<blockquote><p>${inlineMarkdown(quote[1])}</p></blockquote>`)
    } else if (bullet || ordered) {
      flushParagraph()
      const nextList = bullet ? 'ul' : 'ol'
      if (list !== nextList) { closeList(); list = nextList; output.push(`<${list}>`) }
      output.push(`<li>${inlineMarkdown((bullet || ordered)[1])}</li>`)
    } else {
      closeList()
      paragraph.push(line)
    }
  }
  flushParagraph()
  closeList()
  return output.join('\n')
}

function cleanStringArray(value, label, filePath) {
  if (!Array.isArray(value) || !value.length) throw new Error(`${filePath}: ${label} must be a non-empty list.`)
  return [...new Set(value.map(text).filter(Boolean))]
}

function readPost(filePath, source) {
  const { metadata, markdown } = parseFrontmatter(source, filePath)
  const title = text(metadata.title)
  const slug = text(metadata.slug)
  const metaDescription = text(metadata.metaDescription)
  if (!title || !metaDescription || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${filePath}: title, metaDescription, and a canonical lowercase slug are required.`)
  }
  if (metadata.status !== 'draft') throw new Error(`${filePath}: local publishing input must start as status: draft.`)
  const content = markdownToHtml(markdown)
  const words = markdown.replace(/^#.*$/gm, '').trim().split(/\s+/).filter(Boolean).length
  const post = {
    id: slug,
    source_app_id: APP_ID,
    source_ecosystem_id: ECOSYSTEM_ID,
    owner_type: 'app',
    owner_id: APP_ID,
    visibility: 'public',
    publication_scope: 'app',
    title,
    content,
    metaDescription,
    slug,
    author: {
      id: 'fireux',
      display_name: 'FireUX',
      avatar: `${PUBLIC_ORIGIN}/img/app/logo.png`,
      handle: 'fireux',
    },
    keywords: cleanStringArray(metadata.keywords, 'keywords', filePath),
    tags: cleanStringArray(metadata.tags, 'tags', filePath),
    canonicalUrl: `${PUBLIC_ORIGIN}/blog/${slug}`,
    featuredImage: `${PUBLIC_ORIGIN}/img/app/cover.png`,
    socialImage: `${PUBLIC_ORIGIN}/img/app/thumbnail.png`,
    readingTime: `${Math.max(1, Math.ceil(words / 200))} min`,
    cta_link: `${PUBLIC_ORIGIN}/get-started`,
    cta_text: 'Start your App',
    type: 'article',
    product_id: '',
    editorial_review: {
      source_kind: metadata.sourceKind === 'ai-assisted' ? 'ai-assisted' : 'human',
      privacy_reviewed: args['privacy-reviewed'] === true,
      facts_reviewed: args['facts-reviewed'] === true,
      names_approved: args['names-approved'] === true,
    },
  }
  return {
    file: path.relative(process.cwd(), filePath),
    post,
    findings: reviewBlogEditorialContent(post),
  }
}

const filePaths = text(args.files).split(',').map(value => path.resolve(text(value))).filter(Boolean)
if (!filePaths.length || !text(args.files)) throw new Error('Use --files=<draft.md[,draft.md]>')
if (text(args.project) !== PROJECT_ID || text(args.database) !== DATABASE_ID) {
  throw new Error(`Use --project=${PROJECT_ID} --database=${DATABASE_ID}.`)
}

const entries = []
for (const filePath of filePaths) entries.push(readPost(filePath, await readFile(filePath, 'utf8')))
if (new Set(entries.map(entry => entry.post.slug)).size !== entries.length) throw new Error('Draft slugs must be unique.')
const blockers = entries.flatMap(entry => entry.findings.filter(finding => finding.kind === 'blocker').map(finding => `${entry.post.slug}: ${finding.message}`))
if (blockers.length) throw new Error(`Editorial blockers:\n${blockers.join('\n')}`)

const auth = await resolveFirebaseAdminCredential({ args, scope: 'fireux', projectId: PROJECT_ID })
const app = initializeApp({ credential: auth.credential, projectId: PROJECT_ID }, `fireux-blog-${Date.now()}`)
const db = getFirestore(app, DATABASE_ID)
const existing = await db.getAll(...entries.map(entry => db.doc(`${COLLECTION_ID}/${entry.post.slug}`)))
const collisions = existing.filter(snapshot => snapshot.exists).map(snapshot => snapshot.id)
if (collisions.length) throw new Error(`Blog posts already exist: ${collisions.join(', ')}`)

const plan = {
  format: 'fireux-blog-publication-plan/1',
  project_id: PROJECT_ID,
  database_id: DATABASE_ID,
  creates: entries.map(entry => ({
    file: entry.file,
    slug: entry.post.slug,
    title: entry.post.title,
    reading_time: entry.post.readingTime,
    findings: entry.findings,
  })),
}
const planSha256 = hash(plan)
if (args.apply !== true) {
  console.log(JSON.stringify({ mode: 'plan', plan_sha256: planSha256, credential_source: auth.source, ...plan }, null, 2))
  await deleteApp(app)
  process.exit(0)
}
if (text(args.confirm) !== planSha256) throw new Error(`Apply requires --confirm=${planSha256}.`)
for (const entry of entries) assertBlogEditorialApproval(entry.post)

const target = defineFirestoreMutationTarget({
  key: 'fireux.blog-posts',
  lane: 'mcp-skill',
  verbs: ['create'],
  database: { kind: 'named', databaseId: DATABASE_ID },
  collectionPath: COLLECTION_ID,
})
const now = Timestamp.now()
for (const entry of entries) {
  await mcpSkillCreate(app, target, entry.post.slug, {
    ...entry.post,
    created: { at: now, by: ACTOR, app_id: APP_ID },
    updated: { at: now, by: ACTOR },
  })
}

const verified = await db.getAll(...entries.map(entry => db.doc(`${COLLECTION_ID}/${entry.post.slug}`)))
if (verified.some(snapshot => !snapshot.exists || snapshot.data()?.visibility !== 'public')) {
  throw new Error('Post-create Blog verification failed.')
}
console.log(JSON.stringify({
  mode: 'apply',
  ok: true,
  created: verified.map(snapshot => ({ slug: snapshot.id, url: `${PUBLIC_ORIGIN}/blog/${snapshot.id}` })),
  plan_sha256: planSha256,
}, null, 2))
await deleteApp(app)
