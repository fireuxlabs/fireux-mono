import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'
import { readAppDocument } from '../../utils/readApp.ts'

export async function readAppInfo(event: H3Event) {
  const config = useFireUXConfig(event)
  const snapshot = await getRuntimeFirestore()
    .collection('apps')
    .doc(config.appId)
    .get()

  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'App not found' })
  }

  const app = readAppDocument(snapshot.data(), snapshot.id)
  if (!app) {
    throw createError({
      statusCode: 409,
      statusMessage: 'App has an invalid canonical shape',
    })
  }

  return {
    ok: true,
    app,
    derived: {
      ecosystem_id: app.ecosystem_id ?? null,
      generated_at: new Date().toISOString(),
    },
  }
}
