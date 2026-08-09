import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { KitchenStorage } from '../../models/kitchen.model.ts'

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

const text = (value: unknown) => String(value ?? '').trim().toLowerCase()

/** Resolve the authored Kitchen route slug to its stable canonical root. */
export async function readKitchenByRouteSlug(
  db: RuntimeFirestore,
  value: unknown
) {
  const slug = text(value)
  if (!slug) return null

  const matches = await db
    .collection(KitchenStorage.collection)
    .where('slug', '==', slug)
    .limit(2)
    .get()
  if (matches.size > 1) {
    throw createError({
      statusCode: 409,
      statusMessage: `Kitchen route slug "${slug}" is not unique.`,
    })
  }
  const snapshot = matches.docs[0]
  if (!snapshot) return null
  return {
    id: snapshot.id,
    slug,
    snapshot,
    data: snapshot.data() || {},
  }
}
