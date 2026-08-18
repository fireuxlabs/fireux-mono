import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  MenuKioskSkinStorage,
  menuKioskSkinFromDoc,
  type MenuKioskSkin,
  type MenuKioskSkinDoc,
} from '../../../models/kitchen/menu/kiosk-skin.model'

const clean = (value: unknown) => String(value ?? '').trim()
const skinOneAppDefaults = (
  appId: string,
  skinId: string
): MenuKioskSkinDoc | undefined => {
  if (
    appId !== 'misebox-app' ||
    (skinId !== 'spice-dark' && skinId !== 'skin-one')
  )
    return undefined

  const imageUrl = '/img/app/kiosk/skins/skin-one/welcome-background.png'

  return {
    background_image_url: imageUrl,
    catalogue_background_image_url:
      '/img/app/kiosk/skins/skin-one/catalogue-background.png',
    section_card_frame_image_url:
      '/img/app/kiosk/skins/skin-one/category-frame-overlay.png',
    section_card_image_urls: Object.fromEntries(
      [
        'pizza',
        'burgers',
        'kebab-falafel',
        'grill',
        'mains-plates',
        'pasta',
        'mezze-salads',
        'snacks-sides',
        'soft-drinks',
        'traditional',
        'hot-drinks',
        'beer',
        'wine',
        'spirits',
      ].map((key) => [
        key,
        `/img/app/kiosk/skins/skin-one/section-cards/${key}${
          [
            'soft-drinks',
            'traditional',
            'hot-drinks',
            'beer',
            'wine',
            'spirits',
          ].includes(key)
            ? '-plum'
            : ''
        }.png`,
      ])
    ),
    backgrounds: {
      portrait_large: {
        image_url: imageUrl,
        width: 1200,
        height: 1920,
      },
      portrait_compact: {
        image_url: imageUrl,
        width: 1200,
        height: 1920,
      },
      portrait_phone: {
        image_url: imageUrl,
        width: 1200,
        height: 1920,
      },
    },
    tone: 'light',
    thumbnail_image_url: imageUrl,
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
  const appDefaults = skinOneAppDefaults(resolvedAppId, resolvedSkinId)
  const data = appDefaults
    ? {
        ...appDefaults,
        ...rawData,
        section_card_image_urls: {
          ...(appDefaults.section_card_image_urls ?? {}),
          ...(rawData.section_card_image_urls ?? {}),
        },
        backgrounds: {
          ...(appDefaults.backgrounds ?? {}),
          ...(rawData.backgrounds ?? {}),
        },
      }
    : rawData
  if (data.status === 'archived') return undefined

  return menuKioskSkinFromDoc(snap.id, data) || undefined
}
