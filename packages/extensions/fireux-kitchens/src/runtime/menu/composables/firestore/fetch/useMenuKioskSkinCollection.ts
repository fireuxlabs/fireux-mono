import { computed, unref, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import {
  MenuKioskSkinStorage,
  menuKioskSkinFromDoc,
  type MenuKioskSkin,
  type MenuKioskSkinDoc,
} from '../../../models/kiosk-skin.model.ts'

type UseMenuKioskSkinCollectionOptions = {
  appId?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
  enabled?: boolean | Ref<boolean | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const sortSkins = (skins: MenuKioskSkin[]) =>
  [...skins].sort((a, b) => a.label.localeCompare(b.label))

export function useMenuKioskSkinCollection(
  options: UseMenuKioskSkinCollectionOptions = {}
) {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const enabled = computed(() => unref(options.enabled) !== false)
  const resolvedAppId = computed(() =>
    enabled.value ? clean(unref(options.appId)) || clean(appId) : ''
  )
  const collectionPath = computed(() =>
    resolvedAppId.value
      ? `${AppStorage.collection}/${resolvedAppId.value}/${MenuKioskSkinStorage.appCollection}`
      : ''
  )
  const source = firestoreFetchCollection<MenuKioskSkinDoc>(collectionPath)
  const skins = computed(() =>
    sortSkins(
      (source.value ?? [])
        .filter((skin) => skin.status !== 'archived')
        .map((skin) => menuKioskSkinFromDoc(clean(skin.id), skin))
        .filter((skin): skin is MenuKioskSkin => Boolean(skin))
    )
  )
  const pending = computed(
    () => Boolean(collectionPath.value) && source.value === undefined
  )

  return {
    appId: resolvedAppId,
    collectionPath,
    skins,
    pending,
  }
}
