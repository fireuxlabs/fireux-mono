import { computed } from 'vue'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Menu, MenuDesign } from '../../../../models/menu.model'
import {
  DEFAULT_MENU_DESIGN,
  normalizeMenuDesignHex,
  resolveMenuDesign,
} from '../kitchen-menu-design'
import { useKitchenConsoleMenus } from './useKitchenConsoleMenus'

const MAIN_MENU_ID = 'main'

export function useKitchenConsoleMenuDesign() {
  const state = useKitchenConsoleMenus()
  const { appId } = useFireUXConfig()
  const resolveDb = useFirestoreResolver(state.databaseId)

  const mainMenu = computed<Menu | null>(
    () =>
      state.menus.value.find((menu) => String(menu?.id || '') === MAIN_MENU_ID) ??
      null
  )

  const menuDesign = computed(() => resolveMenuDesign(mainMenu.value?.design))

  async function saveMenuDesign(nextDesign: MenuDesign) {
    if (!state.canWrite.value) {
      throw new Error('This kitchen is read-only.')
    }

    const kitchenId = state.kitchenId.value
    const collectionPath = state.collectionPath.value

    if (!kitchenId) {
      throw new Error('No kitchen selected.')
    }

    if (!collectionPath) {
      throw new Error('Menu settings path is not available.')
    }

    if (state.pending.value) {
      throw new Error('Menu settings are still loading.')
    }

    const user = await useRequireUser()
    const menuRef = doc(resolveDb(), collectionPath, MAIN_MENU_ID)
    const design: Required<MenuDesign> = {
      background_hex: normalizeMenuDesignHex(
        nextDesign.background_hex,
        DEFAULT_MENU_DESIGN.background_hex
      ),
      text_hex: normalizeMenuDesignHex(
        nextDesign.text_hex,
        DEFAULT_MENU_DESIGN.text_hex
      ),
    }
    const stamp = serverTimestamp()
    const payload: Partial<Menu> = {
      kitchen_id: kitchenId,
      design,
      updated: {
        at: stamp as any,
        by: user.uid,
      },
    }

    if (!mainMenu.value) {
      Object.assign(payload, {
        name: 'Public Menu',
        description: '',
        active: false,
        currency_code: 'CHF',
        defaults: {
          currency_code: 'CHF',
          active: true,
          description: '',
          photo_url: '',
        },
        service_modes: ['dine_in'],
        sections: [],
        sort_order: 0,
        created: {
          at: stamp as any,
          by: user.uid,
          app_id: appId,
        },
      })
    }

    await setDoc(menuRef, payload, { merge: true })
  }

  return {
    ...state,
    mainMenu,
    menuDesign,
    saveMenuDesign,
  }
}

export type KitchenConsoleMenuDesignState = ReturnType<
  typeof useKitchenConsoleMenuDesign
>
