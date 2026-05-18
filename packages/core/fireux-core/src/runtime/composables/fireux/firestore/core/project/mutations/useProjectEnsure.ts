import { doc, getDoc, serverTimestamp, setDoc, getFirestore } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { useFirebaseApp } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

export function useProjectEnsure() {
  const fireux = useFireUXConfig()
  const runtime = useRuntimeConfig()
  const app = useFirebaseApp()
  const db = getFirestore(app)

  async function ensureProjectDoc() {
    if (fireux.role !== 'global') return

    const firebaseProjectId = String(
      runtime.public?.firebaseEcosystem?.firebase?.projectId || ''
    ).trim()
    const projectId = normalizeSlug(fireux.ecosystem)

    if (!firebaseProjectId || !projectId) return

    const ref = doc(db, 'projects', projectId)
    const snap = await getDoc(ref)

    const mainAppId = String(fireux.appId || '').trim()
    const mainEcosystemId = String(fireux.ecosystem || '').trim()
    const name = String(fireux.appName || fireux.appShortName || projectId).trim()
    const sourceUrl = String(fireux.siteUrl || '').trim()

    if (!snap.exists()) {
      await setDoc(ref, {
        id: projectId,
        app_scope_state: 'dedicated_app',
        app_scope_app_id: mainAppId,
        name,
        slug: projectId,
        description: '',
        image_url: String(fireux.appLogo || fireux.appThumbnail || '').trim(),
        status: 'active',
        source_url: sourceUrl,
        primary_project: true,
        project_type: 'ecosystem_app',
        console_endpoint_url: sourceUrl ? `${sourceUrl}/api/fireux-console` : '',
        app_id: mainAppId,
        ecosystem_id: mainEcosystemId,
        firebase_project_id: firebaseProjectId,
        owner_user_id: '',
        operator_ids: [],
        team_ids: [],
        join_requests: [],
        created: {
          at: serverTimestamp(),
          by: mainAppId,
          app_id: mainAppId,
        },
        updated: {
          at: serverTimestamp(),
          by: mainAppId,
        },
      })
      return
    }

    const data = snap.data() || {}
    const patch: Record<string, unknown> = {}

    if (!String(data.id || '').trim()) {
      patch.id = projectId
    }

    if (!String(data.app_id || '').trim()) {
      patch.app_id = mainAppId
    }

    if (!String(data.ecosystem_id || '').trim()) {
      patch.ecosystem_id = mainEcosystemId
    }

    if (!String(data.firebase_project_id || '').trim()) {
      patch.firebase_project_id = firebaseProjectId
    }

    if (!Array.isArray(data.join_requests)) {
      patch.join_requests = []
    }

    if (!data.created || typeof data.created !== 'object') {
      patch.created = {
        at: serverTimestamp(),
        by: mainAppId,
        app_id: mainAppId,
      }
    }

    if (!Object.keys(patch).length) return

    patch.updated = {
      at: serverTimestamp(),
      by: mainAppId,
    }

    await setDoc(ref, patch, { merge: true })
  }

  return { ensureProjectDoc }
}
