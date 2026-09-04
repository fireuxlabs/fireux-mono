import { createError } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../server/utils/getRuntimeFirestore'

/** Reconcile the reverse locator from the authoritative App.ecosystem_id. */
export async function reconcileAppEcosystemReference(input: {
  appId: string
  appDatabaseId: string
  identityDatabaseId: string
}) {
  const app = await getRuntimeFirestore(input.appDatabaseId)
    .collection('apps')
    .doc(input.appId)
    .get()
  if (!app.exists) return { exists: false, ecosystemId: '' }

  const ecosystemId = String(app.get('ecosystem_id') || '').trim()
  if (!ecosystemId) return { exists: false, ecosystemId: '' }

  const identity = getRuntimeIdentityFirestore(input.identityDatabaseId)
  const ecosystem = await identity.collection('ecosystems').doc(ecosystemId).get()
  if (!ecosystem.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: `The App references missing Ecosystem ${ecosystemId}.`,
    })
  }

  const reference = ecosystem.ref.collection('apps').doc(input.appId)
  const previous = await reference.get()
  const now = FieldValue.serverTimestamp()
  await reference.set({
    app_id: input.appId,
    database_id: input.appDatabaseId,
    created: previous.exists ? previous.data()?.created ?? { at: now } : { at: now },
    updated: { at: now },
  })
  return { exists: true, ecosystemId }
}
