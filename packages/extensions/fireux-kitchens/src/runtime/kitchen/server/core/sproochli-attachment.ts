import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  readSproochliAttachmentConfig,
  type SproochliAttachmentConfig,
} from 'fireux-sproochli/runtime/sproochli'

type RuntimeFirestore = ReturnType<typeof getRuntimeFirestore>

export async function readKitchenSproochliAttachment(
  db: RuntimeFirestore,
  kitchenIdValue: unknown,
  sources?: LiveProjectionSources
): Promise<SproochliAttachmentConfig> {
  const kitchenId = requireFirestoreDocumentId(kitchenIdValue, 'Kitchen id')
  const reference = db.doc(`kitchens/${kitchenId}/integrations/sproochli`)
  sources?.watch(reference)
  const attachment = await reference.get()

  return readSproochliAttachmentConfig(
    attachment.exists ? attachment.data() : undefined
  )
}
