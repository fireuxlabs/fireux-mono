import { FieldValue } from 'firebase-admin/firestore'
import {
  AppEventNames, appUserJoinedEventId, type AppEvent, } from '../../models/event'
import type { AppUser } from '../../models/app-user.model.ts'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import { APP_MUTATION_TARGETS, serverAppEventsTarget, serverAppUsersTarget } from '../mutation-targets'
import { serverUserNotificationsTarget } from '../../../user/server/mutation-targets'
export type PublishAppUserJoinedEventInput = {
  appId: string
  ecosystemId: string
  userId: string
}

export type PublishAppUserJoinedEventResult = {
  created: boolean
  eventId: string
  membershipRole: 'admin' | 'user'
  occurredAt: string
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

function timestampIso(value: unknown): string {
  if (value && typeof value === 'object') {
    const timestamp = value as { toDate?: () => Date; toMillis?: () => number }
    if (typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate()
      if (Number.isFinite(date.getTime())) return date.toISOString()
    }
    if (typeof timestamp.toMillis === 'function') {
      const millis = timestamp.toMillis()
      if (Number.isFinite(millis)) return new Date(millis).toISOString()
    }
  }
  return new Date().toISOString()
}

/**
 * Materializes the app-owned fact that a user membership exists.
 *
 * The deterministic event id makes sign-in retries and opportunistic backfills
 * idempotent. Existing App admins receive owner-only notification projections
 * in the same transaction; external delivery remains a later consumer.
 */
export async function publishAppUserJoinedEvent(
  input: PublishAppUserJoinedEventInput
): Promise<PublishAppUserJoinedEventResult> {
  const apps = APP_MUTATION_TARGETS.runtimeApps
  const memberships = serverAppUsersTarget(input.appId)
  const events = serverAppEventsTarget(input.appId)
  let eventId = ''
  let membershipRole: 'admin' | 'user' | 'dev' = 'user'
  let occurredAt = ''

  const created = await runGuardedServerTransaction(
    apps.database,
    async (mutations) => {
      const [appSnapshot, membershipSnapshot] = await Promise.all([
        mutations.read<Record<string, unknown>>(apps, input.appId),
        mutations.read<AppUser>(memberships, input.userId),
      ])

      if (!appSnapshot.exists) {
        throw new Error('The runtime app does not exist.')
      }
      if (!membershipSnapshot.exists) {
        throw new Error('The authenticated user is not a member of this app.')
      }

      const membership = membershipSnapshot.data as AppUser
      const membershipCreatedAt = membership?.created?.at
      membershipRole = membership.role
      occurredAt = timestampIso(membershipCreatedAt)
      eventId = appUserJoinedEventId(
        input.userId,
        timestampOccurrenceKey(membershipCreatedAt)
      )
      const [eventSnapshot, admins, developers] = await Promise.all([
        mutations.read(events, eventId),
        mutations.query<AppUser>(memberships, {
          field: 'role',
          op: '==',
          value: 'admin',
          limit: 32,
        }),
        mutations.query<AppUser>(memberships, {
          field: 'role',
          op: '==',
          value: 'dev',
          limit: 32,
        }),
      ])
      if (eventSnapshot.exists) return false

      const ecosystemId = String(input.ecosystemId || '').trim()
      const appName =
        String(appSnapshot.data?.name || '').trim() || input.appId

      mutations.create(events, eventId, {
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
          membership_role: membershipRole,
        },
        occurred_at: membershipCreatedAt || FieldValue.serverTimestamp(),
        published_at: FieldValue.serverTimestamp(),
      } as unknown as AppEvent)

      for (const admin of [...admins, ...developers]) {
        if (admin.id === input.userId) continue

        mutations.create(serverUserNotificationsTarget(admin.id), eventId, {
          message: `New user joined ${appName}.`,
          scope: 'app',
          created: {
            at: FieldValue.serverTimestamp(),
            app_id: input.appId,
          },
          read: false,
        })
      }

      return true
    }
  )

  return { created, eventId, membershipRole, occurredAt }
}
