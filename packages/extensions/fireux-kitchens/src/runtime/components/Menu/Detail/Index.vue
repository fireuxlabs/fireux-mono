<template>
  <div
    class="fireux-menu-detail menu-detail"
    :class="themeClassName"
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
      :kitchen-slug="kitchenSlug"
    />

    <p v-else class="menu-detail__state">
      Menu unavailable.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuManifest } from '../../../composables/fireux/menu/useMenuManifest'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

const menuId = computed(() => props.menuId)
const kitchenSlug = computed(() => props.kitchenSlug)
const {
  pending,
  error,
  renderKind,
  documentMenu,
  structuredMenu: detailMenu,
} = useMenuManifest(menuId, {
  kitchenSlug,
})
const documentKitchenName = computed(() =>
  documentMenu.value?.source?.kitchen_name || ''
)
const documentUrl = computed(() =>
  documentMenu.value?.file?.url || ''
)
const pageStyle = computed(() =>
  detailMenu.value?.presentation.pageStyle ||
  documentMenu.value?.page_style ||
  null
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
