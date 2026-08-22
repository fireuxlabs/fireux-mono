import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  readSproochliAttachmentConfig,
  type SproochliAttachmentConfig,
} from 'fireux-sproochli/runtime/sproochli'
import { readKitchenSproochliConfig } from '../../utils/kitchen-readers.ts'

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

export async function readKitchenSproochliAttachment(
  db: RuntimeFirestore,
  kitchenIdValue: unknown,
  rootKitchenData?: Record<string, unknown>
): Promise<SproochliAttachmentConfig> {
  const kitchenId = requireFirestoreDocumentId(kitchenIdValue, 'Kitchen id')
  const attachment = await db
    .doc(`kitchens/${kitchenId}/integrations/sproochli`)
    .get()

  if (attachment.exists) {
    return readSproochliAttachmentConfig(attachment.data())
  }

  const root = rootKitchenData
    ? rootKitchenData
    : (await db.doc(`kitchens/${kitchenId}`).get()).data() || {}
  return readKitchenSproochliConfig(root)
}
