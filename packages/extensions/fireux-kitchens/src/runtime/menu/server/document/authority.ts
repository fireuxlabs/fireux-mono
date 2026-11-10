import { timingSafeEqual } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import {
  KITCHEN_MUTATION_TARGETS,
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
} from '../../../kitchen/server/mutation-targets'
import { requireKitchenWriterAccount } from '../../../kitchen/server/core/operator-access'
import {
  guestKitchenClaimTarget,
  hashGuestKitchenSecret,
} from '../../../kitchen/server/index/onboarding/guest-claim'

export async function readMenuDocumentActor(event: H3Event) {
  const { appId } = useFireUXConfig(event)
  const { uid } = await requireFirebaseBearerUser(
    event,
    'A browser identity is required.',
    { allowAnonymous: true }
  )
  return { appId, uid }
}

/** Recovery proof controls only the guest's single document Menu, never general Kitchen writes. */
export async function requireMenuDocumentAuthority(
  tx: GuardedServerTransaction,
  input: {
    appId: string
    uid: string
    kitchenId: string
    menuId?: string
    claimSecret?: string
  },
  options: { allowArchived?: boolean; exactMenu?: boolean } = {}
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const [kitchen, place, claim] = await Promise.all([
    tx.read(KITCHEN_MUTATION_TARGETS.kitchens, kitchenId),
    tx.read(PLACE_MUTATION_TARGETS.places, kitchenId),
    input.claimSecret
      ? tx.read(guestKitchenClaimTarget(kitchenId), 'guest')
      : Promise.resolve(null),
  ])
  if (!kitchen.exists || !place.exists)
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  const guest = Boolean(input.claimSecret && !claim?.data?.claimed_by)
  if (guest) {
    const hash = hashGuestKitchenSecret(input.claimSecret)
    const stored = String(claim?.data?.secret_hash || '')
    if (
      !/^[a-f0-9]{64}$/.test(stored) ||
      !timingSafeEqual(Buffer.from(stored, 'hex'), Buffer.from(hash, 'hex')) ||
      kitchen.data?.created?.by !== kitchenId ||
      kitchen.data?.created?.app_id !== input.appId
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'This Menu recovery key is invalid.',
      })
  } else await requireKitchenWriterAccount(input, input.uid, tx)
  const menuTarget = serverKitchenMenusTarget(kitchenId)
  const exactId = options.exactMenu
    ? requireFirestoreDocumentId(input.menuId, 'Menu id')
    : ''
  const exact = exactId ? await tx.read(menuTarget, exactId) : null
  const menus = exactId
    ? exact?.exists
      ? [{ id: exactId, data: exact.data! }]
      : []
    : await tx.readAll(menuTarget, 1000)
  const pinned = guest ? String(claim?.data?.document_menu_id || '') : ''
  const activeMenus = menus.filter((menu) => menu.data.status !== 'archived')
  const defaultMenu = guest
    ? menus.find((menu) => menu.data.slug === 'main')
    : activeMenus.find((menu) => menu.data.slug === 'main') || activeMenus[0]
  const id = input.menuId
    ? requireFirestoreDocumentId(input.menuId, 'Menu id')
    : pinned || defaultMenu?.id
  const menu = menus.find((menu) => menu.id === id)
  if (
    !menu ||
    (menu.data.status === 'archived' && (guest || !options.allowArchived))
  )
    throw createError({
      statusCode: 409,
      statusMessage: 'Choose an active document Menu.',
    })
  if (guest && (pinned ? id !== pinned : menu.data.slug !== 'main'))
    throw createError({
      statusCode: 403,
      statusMessage: 'This recovery key belongs to another Menu.',
    })
  const sections =
    menu.data.format !== 'document'
      ? await tx.readAll(serverKitchenMenuSectionsTarget(kitchenId, menu.id), 1)
      : []
  return {
    kitchenId,
    menu,
    kitchen: kitchen.data!,
    place: place.data!,
    menus,
    guest,
    hasStructuredContent: sections.length > 0,
    claimTarget: guest ? guestKitchenClaimTarget(kitchenId) : null,
  }
}

export function assertMenuAcceptsDocument(target: {
  menu: { data: { schedule?: unknown } }
  hasStructuredContent: boolean
}) {
  if (target.menu.data.schedule === 'daily')
    throw createError({
      statusCode: 409,
      statusMessage: 'Daily Menus use dated selections instead of a document.',
    })
  if (target.hasStructuredContent)
    throw createError({
      statusCode: 409,
      statusMessage:
        'This Menu has structured content. Choose an empty or document Menu.',
    })
}
