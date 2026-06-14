import {
  createError,
  defineEventHandler,
  getRouterParam,
} from 'h3'
import { setToolProviderResponseHeaders } from 'fireux-core/runtime/server/utils/tool-provider.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  type GoQrDocToolConfig,
  normalizeDocToolConfig,
} from '../../../utils/tools/doc'

export default defineEventHandler(async (event) => {
  setToolProviderResponseHeaders(event)

  const id = String(getRouterParam(event, 'id') ?? '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Tool id is required.' })
  }

  const snap = await getRuntimeFirestore()
    .collection('tools')
    .doc('doc')
    .collection('configs')
    .doc(id)
    .get()

  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tool not found.' })
  }

  const raw = snap.data() ?? {}
  const config = normalizeDocToolConfig(raw.config) satisfies GoQrDocToolConfig

  return {
    ok: true,
    tool: 'doc',
    id,
    config,
  }
})
