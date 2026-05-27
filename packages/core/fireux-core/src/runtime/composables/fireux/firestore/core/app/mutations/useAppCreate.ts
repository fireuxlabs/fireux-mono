import { doc, getDoc } from 'firebase/firestore'
import type { AppCreateInput } from 'fireux-core/runtime/models/core/app.model'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { normalizeSlug, normalizeString } from '../../../../../../utils/slug/normalizeSlug'
import { validateSlugFormat } from '../../../../../../utils/slug/validateSlugFormat'
import { useFirestore } from '../../../vuefire'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { useEcosystemCreate } from '../../ecosystem/mutations/useEcosystemCreate'
import { useProjectBootstrapCreate } from '../../project/mutations/useProjectBootstrapCreate'
import {
  buildAppEnsureCreateInput,
  buildAppEnsureRepairPatch,
} from '../utils/appEnsurePayload'
import { syncAppMediaToStorage } from '../utils/appMediaSync'

export type AppCreateOptions = {
  collectionPath?: string
}

export type AppCreateResult = {
  created: boolean
  id: string
}

export function useAppCreate(options: AppCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { updateDocument } = useFirestoreUpdate()
  const { createProjectDoc } = useProjectBootstrapCreate()
  const { createEcosystem } = useEcosystemCreate()
  const collectionPath = normalizeString(options.collectionPath || 'apps') || 'apps'

  async function createApp(input?: AppCreateInput): Promise<AppCreateResult> {
    const fireux = useFireUXConfig()
    const payload = input ?? buildAppEnsureCreateInput(fireux)
    const resolvedId = normalizeString(payload?.id)
    const slug = normalizeSlug(payload?.slug)
    const slugFormat = validateSlugFormat(slug, {
      required: true,
      minLength: 3,
      maxLength: 80,
      label: 'App slug',
    })

    if (!resolvedId) {
      throw new Error('App id is required')
    }

    if (!slugFormat.isValid) {
      throw new Error(slugFormat.message || 'Invalid app slug')
    }

    if (!input) {
      await createProjectDoc()
      await createEcosystem()
    }

    const ref = doc(db, collectionPath, resolvedId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      if (!input) {
        const repairPatch = buildAppEnsureRepairPatch(
          (snap.data() as Record<string, unknown>) ?? {},
          fireux
        )

        if (Object.keys(repairPatch).length) {
          await updateDocument(collectionPath, resolvedId, repairPatch)
        }
      }

      return { created: false, id: resolvedId }
    }

    const createPayload = {
      ...payload,
      slug,
    }

    await setDocument(collectionPath, resolvedId, createPayload, {
      creator: true,
    })

    return { created: true, id: resolvedId }
  }

  return { createApp, syncAppMedia: syncAppMediaToStorage }
}
