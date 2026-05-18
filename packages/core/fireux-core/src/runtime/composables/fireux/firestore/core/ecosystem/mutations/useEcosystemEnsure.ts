import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { useFirebaseApp } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { Firestore } from 'firebase/firestore'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useRuntimeConfig } from '#imports'

function normalizeString(value: unknown) {
  return String(value || '').trim()
}

async function resolveFirestoreEcosystemRef(db: Firestore, ecosystemId: string) {
  const ecosystemCollection = collection(db, 'ecosystem')
  const plainRef = doc(ecosystemCollection, ecosystemId)
  const plainSnap = await getDoc(plainRef)
  if (plainSnap.exists()) return plainRef

  const legacyRef = doc(ecosystemCollection, `fireux-${ecosystemId}`)
  const legacySnap = await getDoc(legacyRef)
  if (legacySnap.exists()) return legacyRef

  return plainRef
}

export function useEcosystemEnsure() {
  const fireux = useFireUXConfig()
  const runtime = useRuntimeConfig()
  const app = useFirebaseApp()
  const db = getFirestore(app)

  async function ensureEcosystemDoc() {
    if (fireux.role !== 'global') return

    const runtimeProjectId = normalizeString(
      runtime.public?.firebaseEcosystem?.firebase?.projectId
    )

    const mainAppId = normalizeString(fireux.appId)
    const ecosystemId = normalizeSlug(fireux.ecosystem)

    if (!runtimeProjectId || !mainAppId || !ecosystemId) return

    const ref = await resolveFirestoreEcosystemRef(db, ecosystemId)
    const snap = await getDoc(ref)

    const name = normalizeString(fireux.appName || fireux.appShortName || ecosystemId)
    const imageUrl = normalizeString(fireux.appLogo || fireux.appThumbnail)
    const sourceUrl = normalizeString(fireux.siteUrl)

    if (!snap.exists()) {
      await setDoc(ref, {
        id: ref.id,
        project_id: ecosystemId,
        name,
        slug: ecosystemId,
        description: '',
        image_url: imageUrl,
        source_url: sourceUrl,
        team: '',
        status: 'active',
        apps: [mainAppId],
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

    if (!normalizeString(data.id)) {
      patch.id = ref.id
    }

    if (
      !normalizeString(data.project_id) ||
      normalizeString(data.project_id) === runtimeProjectId
    ) {
      patch.project_id = ecosystemId
    }

    if (!normalizeString(data.name)) {
      patch.name = name
    }

    if (!normalizeString(data.slug)) {
      patch.slug = ecosystemId
    }

    if (typeof data.description !== 'string') {
      patch.description = ''
    }

    if (!normalizeString(data.image_url) && imageUrl) {
      patch.image_url = imageUrl
    }

    if (!normalizeString(data.source_url) && sourceUrl) {
      patch.source_url = sourceUrl
    }

    if (typeof data.team !== 'string') {
      patch.team = ''
    }

    if (!normalizeString(data.status)) {
      patch.status = 'active'
    }

    const currentApps = Array.isArray(data.apps)
      ? data.apps.map((entry) => normalizeString(entry)).filter(Boolean)
      : []

    if (!currentApps.includes(mainAppId)) {
      patch.apps = arrayUnion(mainAppId)
    }

    if (!data.created || typeof data.created !== 'object') {
      patch.created = {
        at: serverTimestamp(),
        by: mainAppId,
        app_id: mainAppId,
      }
    }

    patch.updated = {
      at: serverTimestamp(),
      by: mainAppId,
    }

    await setDoc(ref, patch, { merge: true })
  }

  return { ensureEcosystemDoc }
}
