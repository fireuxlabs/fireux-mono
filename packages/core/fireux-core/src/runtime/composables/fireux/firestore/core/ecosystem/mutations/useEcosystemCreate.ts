import {
  collection,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAssets } from 'fireux-core/runtime/composables/fireux/app/useAssets'
import type { Firestore } from 'firebase/firestore'
import { EcosystemStorage } from '../../../../../../models/system/ecosystem.model'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

function normalizeString(value: unknown) {
  return String(value || '').trim()
}

async function resolveFirestoreEcosystemRef(db: Firestore, ecosystemId: string) {
  const ecosystemCollection = collection(db, EcosystemStorage.collection)
  return doc(ecosystemCollection, ecosystemId)
}

export function useEcosystemCreate() {
  const fireux = useFireUXConfig()
  const db = useFirestore()

  async function createEcosystem() {
    if (fireux.role !== 'global') return
    const brandAssets = useAssets()

    const mainAppId = normalizeString(fireux.appId)
    const projectId = normalizeSlug(fireux.projectId)
    const ecosystemId = normalizeSlug(fireux.ecosystemId)

    if (!projectId || !mainAppId || !ecosystemId) return

    const ref = await resolveFirestoreEcosystemRef(db, ecosystemId)
    const snap = await getDoc(ref)

    const name = normalizeString(fireux.appName || fireux.appShortName || ecosystemId)
    const imageUrl = normalizeString(brandAssets.logo || brandAssets.thumbnail)
    const sourceUrl = normalizeString(fireux.siteUrl)

    if (!snap.exists()) {
      await setDoc(ref, {
        id: ref.id,
        project_id: projectId,
        name,
        slug: ecosystemId,
        description: '',
        image_url: imageUrl,
        website_url: sourceUrl,
        status: 'active',
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

    if (normalizeString(data.project_id) !== projectId) {
      patch.project_id = projectId
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

    const websiteUrl = sourceUrl || normalizeString(data.source_url)
    if (!normalizeString(data.website_url) && websiteUrl) {
      patch.website_url = websiteUrl
    }

    for (const legacyField of ['apps', 'team', 'source_url']) {
      if (legacyField in data) patch[legacyField] = deleteField()
    }

    if (!normalizeString(data.status)) {
      patch.status = 'active'
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

  return { createEcosystem }
}
