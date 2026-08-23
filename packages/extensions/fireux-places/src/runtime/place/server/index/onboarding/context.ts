import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { PlaceOnboardingDefaults } from '../../../models/place-onboarding.model.ts'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from '../../../utils/place-spine'
import {
  record,
  requireMemberRole,
  text,
  type OnboardingContext,
} from './input'

export async function context(
  event: H3Event,
  idValue: unknown
): Promise<OnboardingContext> {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtimeAppId = requireFirestoreDocumentId(
    useRuntimeConfig(event).public?.fireux?.id,
    'Runtime App id'
  )
  const id = requireFirestoreDocumentId(idValue, 'Place id')
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${runtimeAppId}/${'users'}/${uid}`
  )
  const placeRef = db.collection('places').doc(id)
  const membership = await membershipRef.get()
  const role = requireMemberRole(membership.exists, membership.get('role'))
  return { uid, runtimeAppId, role, db, membershipRef, placeRef }
}

export function createdByCurrentApp(
  place: Record<string, unknown>,
  uid: string,
  appId: string
) {
  const created = record(place.created)
  return text(created.by) === uid && text(created.app_id) === appId
}

export function canConfigure(
  place: Record<string, unknown>,
  actor: Pick<OnboardingContext, 'uid' | 'runtimeAppId' | 'role'>
) {
  return (
    actor.role === 'admin' ||
    actor.role === 'dev' ||
    createdByCurrentApp(place, actor.uid, actor.runtimeAppId)
  )
}

export function currentDefaults(value: Record<string, unknown>) {
  const defaults: Partial<PlaceOnboardingDefaults> = {}
  const currency = normalizePlaceCurrencyCode(value.default_currency_code)
  const timezone = normalizePlaceTimezone(value.timezone)
  if (currency) defaults.default_currency_code = currency
  if (timezone) defaults.timezone = timezone
  return defaults
}
