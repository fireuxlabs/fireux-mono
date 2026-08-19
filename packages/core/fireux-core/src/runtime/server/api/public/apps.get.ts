import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import type { AppDirectoryEntry } from '../../../models/utils/directory'
import { AppStorage } from '../../../app/models/app.model.ts'
import { getRuntimeFirestore } from '../../utils/getRuntimeFirestore'
import {
  projectPublicApp,
  toAppDirectoryEntry,
} from '../../../app/server/projection/public-app.dto.ts'
import { asTrimmedString } from '../../utils/public-projection/public-dto.helpers'
import type { PublicCollectionResponse } from '../../utils/public-projection/public-dto.types'

export default defineEventHandler(async (event: H3Event) => {
  const cfg = useFireUXConfig()
  const ecosystemId = String(cfg.ecosystemId || '').trim()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  if (!ecosystemId) {
    const empty: PublicCollectionResponse<AppDirectoryEntry> = {
      ok: true,
      count: 0,
      generatedAt: new Date().toISOString(),
      items: [],
    }
    return empty
  }

  const db = getRuntimeFirestore()
  const snap = await db
    .collection(AppStorage.collection)
    .where('ecosystem_id', '==', ecosystemId)
    .get()

  const apps = snap.docs
    .filter((doc) => asTrimmedString(doc.data()?.status) === 'active')
    .map((doc) => {
      const app = projectPublicApp(doc.data(), { id: doc.id })
      return app ? toAppDirectoryEntry(app) : null
    })
    .filter((app) => app !== null)
    .sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')))

  const response: PublicCollectionResponse<AppDirectoryEntry> = {
    ok: true,
    count: apps.length,
    generatedAt: new Date().toISOString(),
    items: apps,
  }

  return response
})
