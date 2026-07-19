import { FieldValue } from 'firebase-admin/firestore'
import { AppStorage } from '../../../models/core/app.model'
import {
  AppEventNames,
  AppEventStorage,
  appUserJoinedEventId,
  type AppEvent,
} from '../../../models/core/supporting/event'
import {
  UserAppStorage,
  type UserApp,
} from '../../../models/core/user.model'
import { getRuntimeFirestore } from '../getRuntimeFirestore'

export type PublishAppUserJoinedEventInput = {
  appId: string
  ecosystemId: string
  userId: string
}

export type PublishAppUserJoinedEventResult = {
  created: boolean
  eventId: string
}

function timestampOccurrenceKey(value: unknown): string {
  if (!value || typeof value !== 'object') return 'initial'

  const timestamp = value as {
    nanoseconds?: unknown
    seconds?: unknown
    toMillis?: () => number
  }
  if (typeof timestamp.toMillis === 'function') {
    const millis = timestamp.toMillis()
    if (Number.isFinite(millis)) return String(Math.trunc(millis))
  }

  const seconds = Number(timestamp.seconds)
  const nanoseconds = Number(timestamp.nanoseconds)
  if (!Number.isFinite(seconds)) return 'initial'

  return `${Math.trunc(seconds)}-${
    Number.isFinite(nanoseconds) ? Math.trunc(nanoseconds) : 0
  }`
}

/**
 * Materializes the app-owned fact that a user membership exists.
 *
 * The deterministic event id makes sign-in retries and opportunistic backfills
 * idempotent. Notification delivery is intentionally owned by later consumers.
 */
export async function publishAppUserJoinedEvent(
  input: PublishAppUserJoinedEventInput
): Promise<PublishAppUserJoinedEventResult> {
  const db = getRuntimeFirestore()
  const appRef = db.collection(AppStorage.collection).doc(input.appId)
  const membershipRef = appRef
    .collection(UserAppStorage.collection)
    .doc(input.userId)
  let eventId = ''

  const created = await db.runTransaction(async (transaction) => {
    const [appSnapshot, membershipSnapshot] = await Promise.all([
      transaction.get(appRef),
      transaction.get(membershipRef),
    ])

    if (!appSnapshot.exists) {
      throw new Error('The runtime app does not exist.')
    }
    if (!membershipSnapshot.exists) {
      throw new Error('The authenticated user is not a member of this app.')
    }

    const membership = membershipSnapshot.data() as UserApp
    const membershipCreatedAt = membership?.created?.at
    eventId = appUserJoinedEventId(
      input.userId,
      timestampOccurrenceKey(membershipCreatedAt)
    )
    const eventRef = appRef
      .collection(AppEventStorage.collection)
      .doc(eventId)
    const eventSnapshot = await transaction.get(eventRef)
    if (eventSnapshot.exists) return false

    const ecosystemId = String(input.ecosystemId || '').trim()

    transaction.create(eventRef, {
      id: eventId,
      name: AppEventNames.userJoined,
      version: 1,
      app_id: input.appId,
      ecosystem_id: ecosystemId,
      source: 'identity',
      subject: {
        kind: 'user',
        id: input.userId,
      },
      actor: {
        kind: 'user',
        id: input.userId,
      },
      payload: {
        user_id: input.userId,
        membership_role: membership.role === 'admin' ? 'admin' : 'user',
      },
      occurred_at: membershipCreatedAt || FieldValue.serverTimestamp(),
      published_at: FieldValue.serverTimestamp(),
    } as unknown as AppEvent)

    return true
  })

  return { created, eventId }
}
