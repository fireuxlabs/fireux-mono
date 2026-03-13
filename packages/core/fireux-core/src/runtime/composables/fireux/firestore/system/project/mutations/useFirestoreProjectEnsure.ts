import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { useFirebaseApp } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

export function useFirestoreProjectEnsure() {
  const fireux = useFireUXConfig()
  const runtime = useRuntimeConfig()
  const app = useFirebaseApp()
  const db = getFirestore(app)

  async function ensureFirestoreProjectDoc() {
    if (fireux.role !== 'global') return

    const projectId = String(
      runtime.public?.firebaseEcosystem?.firebase?.projectId || ''
    ).trim()

    if (!projectId) return

    const ref = doc(db, 'project', projectId)
    const snap = await getDoc(ref)

    const mainAppId = String(fireux.appId || '').trim()
    const mainEcosystemId = String(fireux.ecosystem || '').trim()

    if (!snap.exists()) {
      await setDoc(ref, {
        main_app_id: mainAppId,
        main_ecosystem_id: mainEcosystemId,
      })
      return
    }

    const data = snap.data() || {}
    const patch: Record<string, string> = {}

    if (!String(data.main_app_id || '').trim()) {
      patch.main_app_id = mainAppId
    }

    if (!String(data.main_ecosystem_id || '').trim()) {
      patch.main_ecosystem_id = mainEcosystemId
    }

    if (!Object.keys(patch).length) return

    await setDoc(ref, patch, { merge: true })
  }

  return { ensureFirestoreProjectDoc }
}
