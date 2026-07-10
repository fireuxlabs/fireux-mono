<template>
  <div
    class="fireux-menu-detail menu-detail"
    :class="[
      themeClassName,
      {
        'menu-detail--kiosk': isKioskMenu,
        'menu-detail--staff-pos': isStaffPosMenu,
      },
    ]"
    :style="themeStyleVars"
  >
    <p v-if="pending" class="menu-detail__state">
      Loading menu...
    </p>

    <p v-else-if="error" class="menu-detail__state">
      Menu unavailable.
    </p>

    <MenuDetailDocument
      v-else-if="renderKind === 'document' && documentMenu"
      :kitchen-name="documentKitchenName"
      :menu="documentMenu"
      :document-url="documentUrl"
    />

    <MenuDetailFood
      v-else-if="detailMenu"
      :menu="detailMenu"
      :menu-id="menuId"
      :menu-context="menuContext"
      :kitchen-slug="kitchenSlug"
    />

    <p v-else class="menu-detail__state">
      Menu unavailable.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'
import { menuContextProfile } from '../../../utils/menu-context'

const props = defineProps<{
  menuId: string
  menuContext?: MenuRouteContext
  kitchenSlug?: string
}>()

const menuId = computed(() => props.menuId)
const menuContext = computed(() => props.menuContext)
const kitchenSlug = computed(() => props.kitchenSlug)
const {
  pending,
  error,
  renderKind,
  document: documentMenu,
  manifest: detailMenu,
} = useMenu(menuId, {
  menuContext,
  kitchenSlug,
})
const documentKitchenName = computed(() =>
  documentMenu.value?.kitchenName || ''
)
const documentUrl = computed(() => {
  const file = documentMenu.value?.file
  if (file?.url) return file.url
  if (!file?.storage_path || !menuId.value) return ''

  const query = new URLSearchParams()
  if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
  const qs = query.toString()

  return `/api/menus/${encodeURIComponent(menuId.value)}/file${qs ? `?${qs}` : ''}`
})
const pageStyle = computed(() =>
  detailMenu.value?.presentation.pageStyle ||
  documentMenu.value?.pageStyle ||
  null
)
const isKioskMenu = computed(() =>
  menuContextProfile(menuContext.value).surface === 'kiosk' ||
    detailMenu.value?.behaviour.surface === 'kiosk'
)
const isStaffPosMenu = computed(() =>
  menuContextProfile(menuContext.value).surface === 'staff_pos' ||
    detailMenu.value?.behaviour.surface === 'staff_pos'
)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({ pageStyle })
</script>

<style scoped>
.menu-detail__state {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
}
</style>
