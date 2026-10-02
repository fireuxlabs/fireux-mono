import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverKitchenKiosksTarget } from './mutation-targets'
import {
  createError,
  deleteCookie,
  getCookie,
  getRequestURL,
  setCookie,
  type H3Event,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { KitchenKioskDeviceRecord } from '../../models/kiosk-device.model.ts'
import {
  KitchenKioskDeviceStorage,
  kitchenServiceSupportsKiosk,
} from '../../utils/kiosk-device.ts'
import { readKitchenServices } from '../../utils/kitchen-services'
import {
  createKitchenKioskSessionCookie,
  matchesKitchenKioskSessionToken,
  readKitchenKioskSessionCookie,
  type KitchenKioskSessionLocator,
} from './session-token.ts'

export const KITCHEN_KIOSK_SESSION_COOKIE = 'fireux_kiosk_session'
export const KITCHEN_KIOSK_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

const text = (value: unknown) => String(value ?? '').trim()
const timestampMillis = (value: unknown) => {
  const candidate = value as { toMillis?: () => number } | null
  const millis = candidate?.toMillis?.()
  return Number.isFinite(millis) ? Number(millis) : 0
}

export const readKitchenKioskSessionFromEvent = (event: H3Event) =>
  readKitchenKioskSessionCookie(getCookie(event, KITCHEN_KIOSK_SESSION_COOKIE))

export function setKitchenKioskSessionCookie(
  event: H3Event,
  locator: KitchenKioskSessionLocator,
  token: string
) {
  setCookie(
    event,
    KITCHEN_KIOSK_SESSION_COOKIE,
    createKitchenKioskSessionCookie(locator, token),
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' ||
        getRequestURL(event).protocol === 'https:',
      sameSite: 'strict',
      path: '/',
      maxAge: KITCHEN_KIOSK_SESSION_MAX_AGE_SECONDS,
    }
  )
}

export function clearKitchenKioskSessionCookie(event: H3Event) {
  deleteCookie(event, KITCHEN_KIOSK_SESSION_COOKIE, {
    path: '/',
    secure:
      process.env.NODE_ENV === 'production' ||
      getRequestURL(event).protocol === 'https:',
    sameSite: 'strict',
  })
}

export function kitchenKioskSessionMatchesRecord(
  session: ReturnType<typeof readKitchenKioskSessionCookie>,
  kioskId: string,
  record: KitchenKioskDeviceRecord,
  now = Date.now()
) {
  return Boolean(
    session &&
      session.locator.kioskId === kioskId &&
      session.locator.kitchenId === text(record.kitchen_id) &&
      Boolean(text(record.kitchen_service_id)) &&
      record.status === 'active' &&
      timestampMillis(record.expires_at) > now &&
      matchesKitchenKioskSessionToken(session.token, text(record.session_hash))
  )
}

export async function requireKitchenKioskSession(
  event: H3Event,
  expected: {
    appId: string
    kitchenId: string
    kitchenServiceId: string
    menuId: string
  },
  mutations?: GuardedServerTransaction
) {
  const session = readKitchenKioskSessionFromEvent(event)
  if (
    !session ||
    !text(expected.kitchenServiceId) ||
    session.locator.kitchenId !== expected.kitchenId
  ) {
    throw unavailableKiosk()
  }
  const kitchenRef = getRuntimeFirestore()
    .collection('kitchens')
    .doc(session.locator.kitchenId)
  const snapshot = mutations
    ? await mutations.read(
        serverKitchenKiosksTarget(expected.kitchenId),
        session.locator.kioskId
      )
    : await kitchenRef
        .collection(KitchenKioskDeviceStorage.collection)
        .doc(session.locator.kioskId)
        .get()
  const record = ((typeof snapshot.data === 'function'
    ? snapshot.data()
    : snapshot.data) || {}) as KitchenKioskDeviceRecord
  if (
    !snapshot.exists ||
    !kitchenKioskSessionMatchesRecord(
      session,
      session.locator.kioskId,
      record
    ) ||
    text(record.app_id) !== expected.appId ||
    text(record.kitchen_id) !== expected.kitchenId ||
    text(record.kitchen_service_id) !== expected.kitchenServiceId ||
    text(record.menu_id) !== expected.menuId
  ) {
    throw unavailableKiosk()
  }
  const kitchen = mutations
    ? await mutations.read(
        FIRESTORE_MUTATION_TARGETS.kitchens,
        expected.kitchenId
      )
    : await kitchenRef.get()
  const kitchenData =
    typeof kitchen.data === 'function' ? kitchen.data() : kitchen.data
  const service = readKitchenServices(kitchenData?.services).find(
    (row) => row.id === expected.kitchenServiceId
  )
  if (
    !kitchen.exists ||
    !kitchenServiceSupportsKiosk(service, expected.menuId)
  ) {
    throw unavailableKiosk()
  }
  return {
    kioskId: session.locator.kioskId,
    kitchenId: expected.kitchenId,
    kitchenServiceId: expected.kitchenServiceId,
    menuId: expected.menuId,
  }
}

function unavailableKiosk() {
  return createError({ statusCode: 404, statusMessage: 'Menu not found.' })
}
