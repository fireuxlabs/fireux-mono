import { randomUUID } from 'node:crypto'
import {
  defineEventHandler,
  getRequestURL,
  readBody,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeDocToolConfig } from '../../../utils/tools/doc'

export default defineEventHandler(async (event) => {
  setToolProviderResponseHeaders(event)

  const body = await readBody(event).catch(() => ({}))
  const config = normalizeDocToolConfig(body)
  const id = randomUUID()
  const path = `/tools/doc/${encodeURIComponent(id)}`

  await getRuntimeFirestore()
    .collection('tools')
    .doc('doc')
    .collection('configs')
    .doc(id)
    .set({
      id,
      tool: 'doc',
      config,
      created: {
        at: FieldValue.serverTimestamp(),
      },
    })

  return {
    ok: true,
    tool: 'doc',
    id,
    path,
    toolUrl: new URL(path, getRequestURL(event).origin).toString(),
  }
})
