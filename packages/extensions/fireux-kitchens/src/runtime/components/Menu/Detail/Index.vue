<template>
  <div
    class="fireux-menu-detail menu-detail"
    :class="themeClassName"
    :style="themeStyleVars"
  >
    <MenuDetailContent
      :view="interaction.detail.view"
      :pending="pending"
      :error="error"
      @update:selected-choice="interaction.detail.select"
      @add="interaction.detail.add"
      @remove="interaction.detail.remove"
    />

    <MenuDetailFunnel
      v-if="interaction.funnel.show"
      :order="interaction.funnel.order"
      @close-panel="interaction.funnel.close"
      @open-panel="interaction.funnel.open"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuManifest } from '../../../composables/fireux/public/menu/useMenuManifest'
import { useMenuThemeSurface } from '../../../composables/fireux/public/menu/useMenuThemeSurface'
import { useMenuOrdering } from '../../../composables/fireux/public/menu/useMenuOrdering'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

const {
  pending,
  error,
  structuredMenu: detailMenu,
} = useMenuManifest(() => props.menuId, {
  kitchenSlug: () => props.kitchenSlug,
})
const pageStyle = computed(() =>
  detailMenu.value?.presentation.pageStyle || null
)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({ pageStyle })
const interaction = useMenuOrdering({
  menu: detailMenu,
  menuId: () => props.menuId,
  kitchenSlug: () => props.kitchenSlug,
})
</script>
