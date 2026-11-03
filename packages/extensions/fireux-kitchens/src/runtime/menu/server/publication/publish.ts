import { createError } from 'h3'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from '../../../kitchen/server/mutation-targets'
import { requireKitchenWriterAccount } from '../../../kitchen/server/core/operator-access'
import { assertKitchenMenuCanPublish } from './validation'
import {
  requireMenuDocumentAuthority,
  assertMenuAcceptsDocument,
} from '../document/authority'
import type { MenuDocument } from '../../models/menu.model'
import type { DocumentData } from 'firebase-admin/firestore'

type PublishKitchenMenuInput = {
  appId: string
  kitchenId: string
  menuId: string
  uid: string
  document?: MenuDocument
  claimSecret?: string
}

export function publishKitchenMenu(input: PublishKitchenMenuInput) {
  return runGuardedServerTransaction({ kind: 'runtime' }, (tx) =>
    stagePublishKitchenMenu(tx, input)
  )
}

export async function stagePublishKitchenMenu(
  tx: GuardedServerTransaction,
  input: PublishKitchenMenuInput
) {
  const target = serverKitchenMenusTarget(input.kitchenId)
  const documentTarget = input.document
    ? await requireMenuDocumentAuthority(tx, input)
    : null
  if (!documentTarget) await requireKitchenWriterAccount(input, input.uid, tx)
  else assertMenuAcceptsDocument(documentTarget)
  const menu = documentTarget
    ? { exists: true, data: documentTarget.menu.data }
    : await tx.read(target, input.menuId)
  if (!menu.exists) throw new Error('Menu not found.')
  const menuData: DocumentData = {
    ...(menu.data || {}),
    ...(input.document ? { format: 'document', doc: input.document } : {}),
    ...(documentTarget?.guest ? { audience: 'private_link' } : {}),
  }
  if (menuData.status === 'archived')
    throw createError({
      statusCode: 409,
      statusMessage: 'Restore this Menu to draft before publishing it.',
    })
  await assertKitchenMenuCanPublish(tx, { ...input, menuData })
  const stamp =
    !input.document && menuData.status === 'published' && menuData.updated
      ? menuData.updated
      : serverAuditStamp({ by: input.uid, appId: input.appId })
  if (documentTarget?.claimTarget)
    tx.update(documentTarget.claimTarget, 'guest', {
      document_menu_id: input.menuId,
    })
  if (menuData.status !== 'published' || input.document)
    tx.update(target, input.menuId, {
      status: 'published',
      updated: stamp,
      ...(input.document ? { format: 'document', doc: input.document } : {}),
      ...(documentTarget?.guest ? { audience: 'private_link' } : {}),
    })
  return { menuId: input.menuId }
}
