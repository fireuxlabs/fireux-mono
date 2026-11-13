import type { H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { readAppDocument } from '../../utils/readApp'
import { isAppMediaComplete } from '../../media/utils'
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
    app: snapshot.exists ? readAppDocument(snapshot.data(), appId) : null,
    mediaReady: snapshot.exists && isAppMediaComplete(snapshot.data()?.media),
    paletteReady: true,
  }
}
