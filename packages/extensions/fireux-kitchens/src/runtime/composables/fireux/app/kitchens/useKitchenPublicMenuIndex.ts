import { computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import {
  normalizePublicKitchenLanguage,
  resolvePublicKitchenLanguageOptions,
} from '../public-kitchen-language'
import { useKitchenCollection } from '../../firestore/kitchen/useKitchen'
import { useMenuCollection } from '../../firestore/menu/useMenu'
import type { Menu } from '../../../../models/menu.model'
import {
  asRecord,
  clean,
  cleanIdentity,
  queryString,
} from '../public-menu-runtime'

function isVisibleMenu(menu: Menu) {
  if ((menu as any).active === false) return false

  const status = clean(menu.status).toLowerCase()
  return !status || !['archived', 'draft', 'inactive', 'private'].includes(status)
}

function sortMenus(a: Menu, b: Menu) {
  return (
    Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
    String(a.name || '').localeCompare(String(b.name || ''))
  )
}

export function useKitchenPublicMenuIndex() {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const slug = computed(() => clean(route.params.slug))
  const publicConfig = runtimeConfig.public as Record<string, unknown>
  const fireuxConfig = asRecord(publicConfig.fireux)
  const publicMenuConfig = asRecord(asRecord(fireuxConfig.misebox).publicMenu)
  const runtimeSproochli = asRecord(fireuxConfig.sproochli)
  const { kitchens, pending: kitchensPending } = useKitchenCollection()

  const kitchen = computed(
    () =>
      kitchens.value.find(
        (item) => cleanIdentity((item as any).slug) === cleanIdentity(slug.value)
      ) ?? null
  )
  const kitchenId = computed(() => clean(kitchen.value?.id))
  const languageSettings = computed(() => asRecord((kitchen.value as any)?.language_settings))
  const sproochliEnabled = computed(
    () =>
      runtimeSproochli.enabled !== false &&
      publicMenuConfig.sproochli !== false &&
      languageSettings.value.sproochli !== false
  )
  const selectedLanguage = computed(() =>
    sproochliEnabled.value
      ? normalizePublicKitchenLanguage(queryString(route.query.sproochli))
      : ''
  )
  const languageOptions = computed(() =>
    sproochliEnabled.value
      ? resolvePublicKitchenLanguageOptions(kitchen.value)
      : []
  )
  const publicLanguageQuery = computed(() =>
    selectedLanguage.value ? `?sproochli=${encodeURIComponent(selectedLanguage.value)}` : ''
  )
  const menuRead = useMenuCollection(kitchenId)
  const menus = computed(() =>
    [...menuRead.menus.value].filter(isVisibleMenu).sort(sortMenus)
  )
  const pending = computed(
    () => kitchensPending.value || (Boolean(kitchenId.value) && menuRead.pending.value)
  )
  const menuLink = (menuId: Menu['id']) =>
    `/kitchens/${encodeURIComponent(slug.value)}/menus/${encodeURIComponent(clean(menuId))}${publicLanguageQuery.value}`

  return {
    slug,
    kitchen,
    menus,
    pending,
    languageOptions,
    selectedLanguage,
    menuLink,
  }
}
