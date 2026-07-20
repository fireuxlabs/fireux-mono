// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: expose only current App initialization state to the shell.

import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { AppStorage } from '../../../../models/core/app.model'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'

export default defineEventHandler(async (event: H3Event) => {
  const { appId } = useFireUXConfig()
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
  }
})
