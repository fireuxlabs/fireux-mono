<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm font-semibold">{{ defaultChromeLabels.menus }}</div>
      </div>
    </template>

    <div class="space-y-4">
      <UButton
        v-if="menusIndexLink"
        size="sm"
        variant="soft"
        color="primary"
        icon="i-lucide-book-open-check"
        :to="menusIndexLink"
      >
        {{ defaultChromeLabels.openMenus }}
      </UButton>

      <div v-if="menusLoading" class="py-4 text-sm text-dimmed">
        {{ defaultChromeLabels.loadingMenus }}
      </div>

      <div v-else-if="!sortedMenus.length" class="py-4 text-sm text-dimmed">
        {{ defaultChromeLabels.noMenusAvailable }}
      </div>

      <div v-else class="grid gap-3 sm:grid-cols-2">
        <KitchenPublicMenuLink
          v-for="menu in sortedMenus"
          :key="menu.id"
          :menu="menu"
          :to="menuLink(menu.id)"
          :summary="defaultChromeLabels.openMenu"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePublicAppScopedSource } from 'fireux-core/runtime/composables/fireux/public/scoped/usePublicScopedEntity'
import { useMenuCollection } from '../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import KitchenPublicMenuLink from './PublicMenuLink.vue'
import type { KitchenSurface } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen: KitchenSurface
}>()

const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const kitchenSlug = computed(() => String((props.kitchen as any)?.slug ?? '').trim())
const appScope = usePublicAppScopedSource(computed(() => props.kitchen))
const kitchenCollectionPath = computed(() =>
  appScope.sourceAppId.value
    ? `apps/${appScope.sourceAppId.value}/kitchens`
    : ''
)
const defaultChromeLabels = {
  menus: 'Menus',
  openMenus: 'Open menus',
  loadingMenus: 'Loading menus...',
  noMenusAvailable: 'No menus available',
  openMenu: 'Open menu',
}
const { publishedMenus, pending: menusPending } = useMenuCollection(
  kitchenId,
  { kitchenCollectionPath }
)

const menusLoading = computed(() =>
  Boolean(kitchenId.value) && menusPending.value
)
const sortedMenus = computed(() =>
  [...publishedMenus.value].sort(
    (a, b) =>
      Number((a as any)?.sort_order || 0) -
        Number((b as any)?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)

const menusIndexLink = computed(() => {
  if (!kitchenSlug.value) return ''
  return `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus`
})

const menuLink = (menuIdRaw: unknown) => {
  const menuId = String(menuIdRaw || '').trim()
  if (!kitchenSlug.value || !menuId) return ''
  return `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(menuId)}`
}
</script>
