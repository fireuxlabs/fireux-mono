import { createError } from 'h3'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import { asTrimmedString } from '../../../server/utils/projection/normalize'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { readAppDocument } from '../../utils/readApp'

export async function readAppDetail(id: unknown) {
  const appId = requireFirestoreDocumentId(id, 'App id')
  const collection = getRuntimeFirestore().collection('apps')
  const doc = await collection.doc(appId).get()

  const raw = doc?.exists
    ? ((doc.data() || {}) as Record<string, unknown>)
    : null
  const isActive = asTrimmedString(raw?.status) === 'active'
  const config = useFireUXConfig()
  const ecosystemId = asTrimmedString(config.ecosystemId)
  const belongsToOwner = ecosystemId
    ? asTrimmedString(raw?.ecosystem_id) === ecosystemId
    : doc?.id === config.appId

  if (!raw || !isActive || !belongsToOwner) {
    throw createError({
      statusCode: 404,
      statusMessage: 'App not found',
    })
  }

  const app = readAppDocument(raw, doc!.id)
  if (!app) {
    throw createError({
      statusCode: 404,
      statusMessage: 'App not found',
    })
  }

  return app
}
