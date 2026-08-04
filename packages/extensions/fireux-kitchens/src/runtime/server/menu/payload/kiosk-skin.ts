import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  MenuKioskSkinStorage,
  menuKioskSkinFromDoc,
  type MenuKioskSkin,
  type MenuKioskSkinDoc,
} from '../../../models/kitchen/menu/kiosk-skin.model'

const clean = (value: unknown) => String(value ?? '').trim()
const localPreviewBackgrounds = (
  appId: string,
  skinId: string
): MenuKioskSkinDoc['backgrounds'] | undefined => {
  if (process.env.NODE_ENV === 'production') return undefined
  if (appId !== 'misebox-app' || skinId !== 'spice-dark') return undefined

  const base = '/img/app/kiosk/skins/spice-dark'

  return {
    portrait_large: {
      image_url: `${base}/portrait-large.png`,
      width: 1080,
      height: 1920,
    },
    portrait_compact: {
      image_url: `${base}/portrait-compact.png`,
      width: 768,
      height: 1024,
    },
    portrait_phone: {
      image_url: `${base}/portrait-phone.png`,
      width: 390,
      height: 844,
    },
  }
}

export async function readMenuKioskSkin(
  appId: unknown,
  skinId: unknown
): Promise<MenuKioskSkin | undefined> {
  const resolvedAppId = clean(appId)
  const resolvedSkinId = clean(skinId)
  if (!resolvedAppId || !resolvedSkinId) return undefined

  const snap = await getRuntimeFirestore()
    .collection(
      `${AppStorage.collection}/${resolvedAppId}/${MenuKioskSkinStorage.appCollection}`
    )
    .doc(resolvedSkinId)
    .get()

  if (!snap.exists) return undefined

  const rawData = snap.data() as MenuKioskSkinDoc
  const previewBackgrounds = localPreviewBackgrounds(resolvedAppId, resolvedSkinId)
  const data = previewBackgrounds
    ? {
        ...rawData,
        background_image_url:
          previewBackgrounds.portrait_large?.image_url ||
          rawData.background_image_url,
        backgrounds: {
          ...(rawData.backgrounds ?? {}),
          ...previewBackgrounds,
        },
        thumbnail_image_url:
          previewBackgrounds.portrait_compact?.image_url ||
          rawData.thumbnail_image_url,
      }
    : rawData
  if (data.status === 'archived') return undefined

  return menuKioskSkinFromDoc(snap.id, data) || undefined
}
