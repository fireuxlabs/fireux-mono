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
import { readKitchenServices } from '../../../utils/kitchen-services'
import { kitchenServiceSupportsKiosk } from '../../../utils/kiosk-device'
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

function summarizeKitchenKioskDevice(
  id: string,
  record: KitchenKioskDeviceRecord,
  path: string,
  session: ReturnType<typeof readKitchenKioskSessionFromEvent>,
  serviceName: string,
  now = Date.now()
): KitchenKioskDeviceSummary {
  const expired =
    record.status === 'active' && timestampMillis(record.expires_at) <= now
  return {
    id,
    label: text(record.label) || 'Kiosk',
    kitchenServiceId: text(record.kitchen_service_id),
    serviceName,
    menuId: text(record.menu_id),
    status:
      record.status === 'active' && !text(record.kitchen_service_id)
        ? 'reactivation-required'
        : expired
          ? 'expired'
          : record.status,
    expiresAt: timestampIso(record.expires_at),
    current:
      Boolean(path) &&
      kitchenKioskSessionMatchesRecord(session, id, record, now),
    livePath: path,
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
    const authority = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const records = await mutations.readAll<KitchenKioskDeviceRecord>(
      serverKitchenKiosksTarget(kitchenId),
      MAX_KIOSKS_PER_KITCHEN
    )
    devices = await Promise.all(
      records.map(async ({ id, data }) => {
        const menu = await mutations.read<Record<string, unknown>>(
          serverKitchenMenusTarget(kitchenId),
          data.menu_id
        )
        const service = readKitchenServices(authority.rootData.services).find(
          (row) => row.id === text(data.kitchen_service_id)
        )
        const path =
          kitchenServiceSupportsKiosk(service, text(data.menu_id)) &&
          menu.exists &&
          menu.data?.slug
            ? `/kitchens/${encodeURIComponent(text(authority.rootData.slug))}/menus/${encodeURIComponent(text(menu.data.slug))}.kiosk?service=${encodeURIComponent(text(data.kitchen_service_id))}`
            : ''
        return summarizeKitchenKioskDevice(
          id,
          data,
          path,
          session,
          service?.name || ''
        )
      })
    )
    devices.sort((left, right) => left.label.localeCompare(right.label))
  })

  return { ok: true as const, devices }
}

export async function activateKitchenKioskDevice(
  event: H3Event,
  input: {
    kitchenId: string
    kitchenServiceId: string
    menuId: string
    label?: string
  }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input.menuId, 'Menu id')
  const kitchenServiceId = requireFirestoreDocumentId(
    input.kitchenServiceId,
    'Kitchen service id'
  )
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
  let path = ''
  let serviceName = ''

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const authority = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const service = readKitchenServices(authority.rootData.services).find(
      (row) => row.id === kitchenServiceId
    )
    if (!kitchenServiceSupportsKiosk(service, menuId)) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Choose an enabled service with serving hours, this Menu, and an unpaused Eat in or Takeaway interaction.',
      })
    }
    serviceName = service!.name
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
    if (
      !menu.exists ||
      text(menu.data?.status) !== 'published' ||
      !text(menu.data?.slug) ||
      text((menu.data?.doc as { url?: unknown } | undefined)?.url)
    ) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Choose a published Menu with items and prices before activating a Kiosk.',
      })
    }
    const kitchenSlug = text(authority.rootData.slug)
    if (!kitchenSlug) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Set the Kitchen slug before activating a Kiosk.',
      })
    }
    path = `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(text(menu.data?.slug))}.kiosk?service=${encodeURIComponent(kitchenServiceId)}`
    const label = requestedLabel || `${serviceName} kiosk`
    record = {
      app_id: actor.runtimeAppId,
      kitchen_id: kitchenId,
      kitchen_slug: kitchenSlug,
      kitchen_service_id: kitchenServiceId,
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
      ...summarizeKitchenKioskDevice(kioskId, record, path, null, serviceName),
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
