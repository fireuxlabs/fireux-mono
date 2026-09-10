// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: expose only current App initialization state to the shell.

import type { H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { isAppMediaComplete } from '../../composables/firestore/utils/appMedia'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'

export async function readAppStatus(event: H3Event) {
  const config = useFireUXConfig(event)
  const { appId } = config
  const snapshot = await getRuntimeFirestore()
    .collection('apps')
    .doc(appId)
    .get()

  return {
    ok: true as const,
    appId,
    initialized: snapshot.exists,
    selfJoinEnabled:
      snapshot.exists && snapshot.data()?.self_join_enabled === true,
    mediaReady: snapshot.exists && isAppMediaComplete(snapshot.data()?.media),
    paletteReady: true,
  }
}
