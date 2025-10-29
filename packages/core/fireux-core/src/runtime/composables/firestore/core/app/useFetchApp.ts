import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from '../../../FireUXConfig.ts'
import type { App } from '../../../../models/core/app.model.ts'

/**
 * Fetch a single app document by id or the current appId from config.
 * Reactive via VueFire. No extra logic.
 */
export function useFetchApp(appId?: string) {
  const db = useFirestore()
  const { appId: currentAppId } = useFireUXConfig()
  const id = appId || currentAppId
  if (!id) throw new Error('useFetchApp: no appId found')

  const ref = doc(db, 'apps', id)
  const { data: app } = useDocument<App>(ref as any)

  return { app }
}
