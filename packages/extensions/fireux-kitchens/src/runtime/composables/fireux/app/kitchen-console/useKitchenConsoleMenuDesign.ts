import { computed } from 'vue'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  normalizePublicMenuColorMode,
  resolvePublicMenuDesign,
  type PublicMenuDesign,
} from '../public-menu-design'
import { useKitchenConsole } from './useKitchenConsole'

export function useKitchenConsoleMenuDesign() {
  const state = useKitchenConsole()
  const resolveDb = useFirestoreResolver(state.databaseId)

  const publicMenuDesign = computed(() =>
    resolvePublicMenuDesign(
      (state.selectedKitchen.value as Record<string, unknown> | null)
        ?.public_menu_design
    )
  )

  async function savePublicMenuDesign(nextDesign: PublicMenuDesign) {
    if (!state.canWrite.value) {
      throw new Error('This kitchen is read-only.')
    }

    const kitchenId = state.kitchenId.value
    const rootCollection = state.rootCollection.value

    if (!kitchenId) {
      throw new Error('No kitchen selected.')
    }

    if (!rootCollection) {
      throw new Error('Kitchen settings path is not available.')
    }

    const colorMode = normalizePublicMenuColorMode(nextDesign.color_mode)
    if (!colorMode) {
      throw new Error('Choose light or dark menu mode.')
    }

    const user = await useRequireUser()
    const kitchenRef = doc(resolveDb(), rootCollection, kitchenId)

    await setDoc(
      kitchenRef,
      {
        public_menu_design: {
          color_mode: colorMode,
        },
        updated: {
          at: serverTimestamp() as any,
          by: user.uid,
        },
      },
      { merge: true }
    )
  }

  const debug = computed(() => ({
    mode: state.selectedMode.value,
    kitchenId: state.kitchenId.value,
    rootCollection: state.rootCollection.value,
    databaseId: state.databaseId.value,
    canWrite: state.canWrite.value,
    publicMenuDesign: publicMenuDesign.value,
  }))

  return {
    ...state,
    publicMenuDesign,
    savePublicMenuDesign,
    debug,
  }
}

export type KitchenConsoleMenuDesignState = ReturnType<
  typeof useKitchenConsoleMenuDesign
>
