// Protect the App-owned Ignition intake workflow with canonical App membership authority.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import { AppUserStorage } from 'fireux-core/runtime/user/models/user.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getFirestoreDb } from './firebase-admin'

const text = (value: unknown) => String(value ?? '').trim()

export async function requireFireuxAppAdmin(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig(event)
  const appId = text(runtime.public?.fireux?.id)
  if (!appId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The FireUX App identity is not configured.',
    })
  }

  const db = await getFirestoreDb()
  const appRef = db.collection(AppStorage.collection).doc(appId)
  const [appSnapshot, membershipSnapshot] = await Promise.all([
    appRef.get(),
    appRef.collection(AppUserStorage.collection).doc(uid).get(),
  ])
  const membership = (membershipSnapshot.data() || {}) as Record<
    string,
    unknown
  >

  if (!appSnapshot.exists || text(membership.role) !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App admin access is required.',
    })
  }

  return { appId, db, uid }
}
