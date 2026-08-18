import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, setHeader } from 'h3'
import { AppUserStorage } from 'fireux-core/runtime/user/models/user.model'
import { requireDevDeveloper } from 'fireux-core/runtime/server/utils/auth/developer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  INTERLAKEN_ESSEN_APP_ID,
  MARKETPLACE_PROFILE_COLLECTION,
} from '../../../app/content/marketplace-profile'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event)
  const appId = String(runtime.public?.fireux?.id || '').trim()
  if (appId !== INTERLAKEN_ESSEN_APP_ID) {
    fail(500, 'The Interlaken Essen runtime identity is not configured.')
  }

  const { uid } = await requireDevDeveloper(event)
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')

  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${appId}/${AppUserStorage.collection}/${uid}`
  )
  const profileRef = db.doc(
    `apps/${appId}/${MARKETPLACE_PROFILE_COLLECTION}/${uid}`
  )

  const profileRemoved = await db.runTransaction(async (transaction) => {
    const [membership, profile] = await Promise.all([
      transaction.get(membershipRef),
      transaction.get(profileRef),
    ])
    const role = String(membership.get('role') || '').trim()
    if (!membership.exists || (role !== 'user' && role !== 'admin')) {
      fail(409, 'A valid Interlaken Essen membership is required.')
    }

    if (profile.exists) transaction.delete(profileRef)
    transaction.update(membershipRef, {
      onboarding_status: 'pending',
      updated: serverAuditStamp({ by: uid }),
    })

    return profile.exists
  })

  return {
    ok: true,
    onboarding_status: 'pending' as const,
    profile_removed: profileRemoved,
  }
})
