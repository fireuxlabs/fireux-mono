import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  readSproochliAttachmentConfig,
  type SproochliAttachmentConfig,
} from 'fireux-sproochli/runtime/sproochli'

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

export async function readKitchenSproochliAttachment(
  db: RuntimeFirestore,
  kitchenIdValue: unknown
): Promise<SproochliAttachmentConfig> {
  const kitchenId = requireFirestoreDocumentId(kitchenIdValue, 'Kitchen id')
  const attachment = await db
    .doc(`kitchens/${kitchenId}/integrations/sproochli`)
    .get()

  return readSproochliAttachmentConfig(
    attachment.exists ? attachment.data() : undefined
  )
}
