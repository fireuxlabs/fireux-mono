// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { AppModel } from 'fireux-core/runtime/models/core/app.model'
import { useFirestore } from 'vuefire'
import { createEmptyAppSocialLinks } from '../utils/factories/createEmptyAppSocialLinks'
import { useImageStorage } from '../../../../firebase/useImageStorage'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import {
    appImageFirestoreField,
    appImageStoragePath,
    type AppImageKind,
} from '../utils/appMedia'

type EnsureAppResult = {
  created: boolean
  id: string
}

export function useAppEnsure() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  async function syncNewAppImages(appId: string) {
    const uploads: Array<{ kind: AppImageKind; localPath: string }> = [
      { kind: 'logo', localPath: '/img/app/logo.png' },
      { kind: 'wordmarkLight', localPath: '/img/app/wordmark-light.png' },
      { kind: 'wordmarkDark', localPath: '/img/app/wordmark-dark.png' },
      { kind: 'thumbnail', localPath: '/img/app/thumbnail.png' },
    ]

    const patch: Record<string, string> = {}

    for (const item of uploads) {
      try {
        const storagePath = appImageStoragePath(appId, item.kind)
        const field = appImageFirestoreField(item.kind)
        const url = await uploadImage(storagePath, item.localPath)
        patch[field] = url
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[useAppEnsure] media upload failed', {
            appId,
            kind: item.kind,
            error,
          })
        }
      }
    }

    if (!Object.keys(patch).length) return

    await updateDocument('apps', appId, patch)
  }

  async function ensureApp(): Promise<EnsureAppResult> {
    const fireux = useFireUXConfig()

    const ref = doc(db, 'apps', fireux.appId)
    const snap = await getDoc(ref)

    // Already exists → nothing to do
    if (snap.exists()) {
      return { created: false, id: fireux.appId }
    }

    // NOTE: App creation does NOT imply user membership.
    // User ↔ App binding is handled explicitly elsewhere.

    const payload = {
      app_name: fireux.appName,
      app_short_name: fireux.appShortName,
      role: fireux.role,
      ecosystem: fireux.ecosystem,

      join_requests: [],
      admin_ids: [],

      tagline: '',
      description: '',
      short_bio: '',
      long_bio: '',

      social_links: createEmptyAppSocialLinks(),

      derived: {
        user_count: 0,
      },

      media: {
        thumbnail_url: '',
        logo_url: '',
        wordmark_light_url: '',
        wordmark_dark_url: '',
        cover_url: '',
      },
    } as Omit<AppModel, 'created' | 'updated' | 'id'>

    await setDocument('apps', fireux.appId, payload, {
      creator: true,
    })

    await syncNewAppImages(fireux.appId)

    return { created: true, id: fireux.appId }
  }

  return { ensureApp }
}
