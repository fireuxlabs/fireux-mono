import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { MenuDocumentRead } from '../../models/menu-detail.model'
import type { MenuDocument } from '../../models/menu.model'
import { menuDocumentFilePath } from '../../utils/navigation/route'
import {
  readMenuDocumentActor,
  requireMenuDocumentAuthority,
} from './authority'

export function menuDocumentRevision(data: {
  doc?: Partial<MenuDocument>
  status?: unknown
  slug?: unknown
}) {
  return data.doc?.url
    ? createHash('sha256')
        .update(JSON.stringify([data.doc, data.status, data.slug]))
        .digest('hex')
    : ''
}

export function menuDocumentToolProjection(
  target: Awaited<ReturnType<typeof requireMenuDocumentAuthority>>
): MenuDocumentRead {
  const data = target.menu.data
  const menuPath = `/kitchens/${encodeURIComponent(String(target.kitchen.identity?.slug || ''))}/menus/${encodeURIComponent(String(data.slug || ''))}`
  return {
    kitchenId: target.kitchenId,
    menuId: target.menu.id,
    venue: String(target.place.name || ''),
    name: String(data.name || ''),
    status: data.status as MenuDocumentRead['status'],
    revision: menuDocumentRevision(data),
    acceptsDocument: !target.hasStructuredContent,
    document: data.doc?.url
      ? { url: data.doc.url, name: data.doc.name, type: data.doc.type }
      : null,
    previewUrl:
      data.status === 'published'
        ? menuDocumentFilePath({
            menuId: data.slug,
            kitchenSlug: target.kitchen.identity?.slug,
          })
        : String(data.doc?.url || ''),
    menuPath,
    qrPath: `${menuPath}/qr`,
    menus: (target.guest
      ? [target.menu]
      : target.menus.filter((menu) => menu.data.status !== 'archived')
    ).map((menu) => ({
      value: menu.id,
      label: String(menu.data.name || menu.id),
    })),
  }
}

export async function readKitchenDocumentMenu(
  event: H3Event,
  input: { kitchenId: string; menuId?: string; claimSecret?: string }
) {
  const actor = await readMenuDocumentActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) =>
    menuDocumentToolProjection(
      await requireMenuDocumentAuthority(tx, { ...actor, ...input })
    )
  )
}
