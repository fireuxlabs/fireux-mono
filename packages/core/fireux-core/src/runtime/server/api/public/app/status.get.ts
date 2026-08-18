// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: expose only current App initialization state to the shell.

import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { AppStorage } from '../../../../app/models/app.model.ts'
import { isAppMediaComplete } from '../../../../app/composables/firestore/utils/appMedia'
import { readAppPaletteLayer } from '../../../../utils/brand-palette'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'

export default defineEventHandler(async (event: H3Event) => {
  const config = useFireUXConfig(event)
  const { appId } = config
  const snapshot = await getRuntimeFirestore()
    .collection(AppStorage.collection)
    .doc(appId)
    .get()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  return {
    ok: true as const,
    appId,
    initialized: snapshot.exists,
    mediaReady: snapshot.exists && isAppMediaComplete(snapshot.data()?.media),
    paletteReady:
      !config.theme || Boolean(readAppPaletteLayer(snapshot.data()?.theme?.palette)),
  }
})
