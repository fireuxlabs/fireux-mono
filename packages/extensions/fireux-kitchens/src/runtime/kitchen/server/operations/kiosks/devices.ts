import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { Timestamp } from 'firebase-admin/firestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  serverAuditStamp,
  serverTimestamp,
} from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type {
  KitchenKioskDeviceRecord,
  KitchenKioskDeviceSummary,
} from '../../../models/kiosk-device.model.ts'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../core/mutation-authority.ts'
import { serverKitchenKiosksTarget } from './mutation-targets.ts'
import {
  clearKitchenKioskSessionCookie,
  KITCHEN_KIOSK_SESSION_MAX_AGE_SECONDS,
  kitchenKioskSessionMatchesRecord,
  readKitchenKioskSessionFromEvent,
  setKitchenKioskSessionCookie,
} from './session.ts'
import { createKitchenKioskSessionToken } from './session-token.ts'

const text = (value: unknown) => String(value ?? '').trim()
const MAX_KIOSKS_PER_KITCHEN = 100
const MAX_KIOSK_LABEL_LENGTH = 80

type FirestoreTimestamp = { toDate?: () => Date; toMillis?: () => number }

const timestampMillis = (value: unknown) => {
  const millis = (value as FirestoreTimestamp | null)?.toMillis?.()
  return Number.isFinite(millis) ? Number(millis) : 0
}

const timestampIso = (value: unknown) => {
  const date = (value as FirestoreTimestamp | null)?.toDate?.()
  return date instanceof Date && Number.isFinite(date.getTime())
    ? date.toISOString()
    : ''
}

const livePath = (record: KitchenKioskDeviceRecord) =>
  `/kitchens/${encodeURIComponent(text(record.kitchen_slug))}/menus/${encodeURIComponent(text(record.menu_id))}.kiosk`

function summarizeKitchenKioskDevice(
  id: string,
  record: KitchenKioskDeviceRecord,
  session: ReturnType<typeof readKitchenKioskSessionFromEvent>,
  now = Date.now()
): KitchenKioskDeviceSummary {
  const expired =
    record.status === 'active' && timestampMillis(record.expires_at) <= now
  return {
    id,
    label: text(record.label) || 'Kiosk',
    menuId: text(record.menu_id),
    status: expired ? 'expired' : record.status,
    expiresAt: timestampIso(record.expires_at),
    current: kitchenKioskSessionMatchesRecord(session, id, record, now),
    livePath: livePath(record),
  }
}

export async function readKitchenKioskDevices(
  event: H3Event,
  input: { kitchenId: string }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  const session = readKitchenKioskSessionFromEvent(event)
  let devices: KitchenKioskDeviceSummary[] = []

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const records = await mutations.readAll<KitchenKioskDeviceRecord>(
      serverKitchenKiosksTarget(kitchenId),
      MAX_KIOSKS_PER_KITCHEN
    )
    devices = records
      .map(({ id, data }) => summarizeKitchenKioskDevice(id, data, session))
      .sort((left, right) => left.label.localeCompare(right.label))
  })

  return { ok: true as const, devices }
}

export async function activateKitchenKioskDevice(
  event: H3Event,
  input: { kitchenId: string; menuId: string; label?: string }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input.menuId, 'Menu id')
  const requestedLabel = text(input.label)
  if (requestedLabel.length > MAX_KIOSK_LABEL_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kiosk label must be ${MAX_KIOSK_LABEL_LENGTH} characters or fewer.`,
    })
  }
  const actor = await readKitchenMutationActor(event)
  const kioskId = randomUUID()
  const session = createKitchenKioskSessionToken()
  const expiresAt = Timestamp.fromMillis(
    Date.now() + KITCHEN_KIOSK_SESSION_MAX_AGE_SECONDS * 1_000
  )
  let record: KitchenKioskDeviceRecord | null = null

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const authority = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const kiosks = serverKitchenKiosksTarget(kitchenId)
    const active = await mutations.query<KitchenKioskDeviceRecord>(kiosks, {
      field: 'status',
      op: '==',
      value: 'active',
      limit: MAX_KIOSKS_PER_KITCHEN,
    })
    if (active.length >= MAX_KIOSKS_PER_KITCHEN) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Revoke an old Kiosk before activating another one.',
      })
    }
    const menu = await mutations.read<Record<string, unknown>>(
      serverKitchenMenusTarget(kitchenId),
      menuId
    )
    if (!menu.exists || text(menu.data?.status) !== 'published') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Publish the selected Menu before activating a Kiosk.',
      })
    }
    const kitchenSlug = text(authority.rootData.slug)
    if (!kitchenSlug) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Set the Kitchen slug before activating a Kiosk.',
      })
    }
    const label = requestedLabel || `${text(menu.data?.name) || 'Menu'} kiosk`
    record = {
      app_id: actor.runtimeAppId,
      kitchen_id: kitchenId,
      kitchen_slug: kitchenSlug,
      menu_id: menuId,
      label,
      status: 'active',
      session_hash: session.hash,
      expires_at: expiresAt,
      created: serverAuditStamp({
        by: actor.uid,
        appId: actor.runtimeAppId,
      }),
      updated: serverAuditStamp({ by: actor.uid }),
    }
    mutations.create(kiosks, kioskId, record)
  })

  if (!record) throw new Error('Kiosk activation did not create a device.')
  setKitchenKioskSessionCookie(event, { kitchenId, kioskId }, session.token)
  return {
    ok: true as const,
    device: {
      ...summarizeKitchenKioskDevice(kioskId, record, null),
      current: true,
    },
  }
}

export async function revokeKitchenKioskDevice(
  event: H3Event,
  input: { kitchenId: string; kioskId: string }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const kioskId = requireFirestoreDocumentId(input.kioskId, 'Kiosk id')
  const actor = await readKitchenMutationActor(event)

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const kiosks = serverKitchenKiosksTarget(kitchenId)
    const device = await mutations.read<KitchenKioskDeviceRecord>(
      kiosks,
      kioskId
    )
    if (!device.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Kiosk not found.' })
    }
    if (device.data?.status !== 'revoked') {
      mutations.update<KitchenKioskDeviceRecord>(kiosks, kioskId, {
        status: 'revoked',
        session_hash: '',
        revoked_at: serverTimestamp(),
        revoked_by: actor.uid,
        updated: serverAuditStamp({ by: actor.uid }),
      })
    }
  })

  const current = readKitchenKioskSessionFromEvent(event)
  if (
    current?.locator.kitchenId === kitchenId &&
    current.locator.kioskId === kioskId
  ) {
    clearKitchenKioskSessionCookie(event)
  }
  return { ok: true as const, kioskId }
}
