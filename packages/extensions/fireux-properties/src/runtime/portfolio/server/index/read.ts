import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { PortfolioStorage } from '../../models/portfolio.model.ts'
import type {
  PortfolioDirectoryPage,
  PortfolioDetailResponse,
  PortfolioPublicSummary,
} from '../../models/portfolio-read.model.ts'

const PAGE_SIZE = 24
const encodeCursor = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64url')
const decodeCursor = (value: unknown) => {
  const cursor = String(value ?? '').trim()
  if (!cursor) return ''
  try {
    const id = Buffer.from(cursor, 'base64url').toString('utf8')
    return isFirestoreDocumentId(id) && encodeCursor(id) === cursor ? id : ''
  } catch {
    return ''
  }
}

/** Active is the current public eligibility policy; it never exposes a management record. */
function portfolioPublicSummary(
  id: string,
  value: Record<string, unknown>
): PortfolioPublicSummary | null {
  const identity = value.identity
  if (!identity || typeof identity !== 'object' || Array.isArray(identity)) return null
  const source = identity as Record<string, unknown>
  if (source.status !== 'active') return null
  const name = typeof source.name === 'string' ? source.name.trim() : ''
  const slug = typeof source.slug === 'string' ? source.slug.trim() : ''
  if (
    !isFirestoreDocumentId(id) ||
    !name ||
    slug !== id ||
    ['tagline', 'image_url', 'region_label'].some(
      (key) => source[key] !== undefined && typeof source[key] !== 'string'
    )
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Portfolio public identity source is invalid.',
    })
  }
  return {
    id,
    identity: {
      slug, name, status: 'active',
      tagline: String(source.tagline || '').trim(),
      image_url: String(source.image_url || '').trim(),
      region_label: String(source.region_label || '').trim(),
    },
  }
}

export async function readPortfolioDirectoryPage(
  cursorValue?: unknown
): Promise<PortfolioDirectoryPage> {
  const requested = String(cursorValue ?? '').trim()
  const cursor = decodeCursor(requested)
  if (requested && !cursor)
    throw createError({
      statusCode: 400,
      statusMessage: 'Portfolio cursor is invalid.',
    })
  let query = getRuntimeFirestore()
    .collection(PortfolioStorage.rootCollection)
    .orderBy(FieldPath.documentId())
    .limit(PAGE_SIZE + 1)
  if (cursor) query = query.startAfter(cursor)
  const snapshot = await query.get().catch(() => {
    throw createError({
      statusCode: 503,
      statusMessage: 'Portfolio directory could not be read.',
    })
  })
  const pageDocs = snapshot.docs.slice(0, PAGE_SIZE)
  const items = pageDocs
    .map((doc) => portfolioPublicSummary(doc.id, doc.data()))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
  const nextCursor =
    snapshot.size > PAGE_SIZE && pageDocs.length
      ? encodeCursor(pageDocs[pageDocs.length - 1]!.id)
      : ''
  return { items, ...(nextCursor ? { nextCursor } : {}) }
}

export async function readPortfolioDetail(
  idValue: unknown
): Promise<PortfolioDetailResponse> {
  const id = String(idValue ?? '').trim()
  if (!isFirestoreDocumentId(id))
    throw createError({
      statusCode: 404,
      statusMessage: 'Portfolio not found.',
    })
  const snapshot = await getRuntimeFirestore()
    .collection(PortfolioStorage.rootCollection)
    .doc(id)
    .get()
  const portfolio = snapshot.exists
    ? portfolioPublicSummary(snapshot.id, snapshot.data() || {})
    : null
  if (!portfolio || portfolio.identity.status !== 'active')
    throw createError({
      statusCode: 404,
      statusMessage: 'Portfolio not found.',
    })
  return { portfolio }
}
