import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  MenuKioskSkinStorage,
  menuKioskSkinFromDoc,
  type MenuKioskSkin,
  type MenuKioskSkinDoc,
} from '../../../models/kitchen/menu/kiosk-skin.model'

const clean = (value: unknown) => String(value ?? '').trim()

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

  const data = snap.data() as MenuKioskSkinDoc
  if (data.status === 'archived') return undefined

  return menuKioskSkinFromDoc(snap.id, data) || undefined
}
