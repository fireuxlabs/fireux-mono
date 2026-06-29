<template>
  <div
    class="fireux-menu-detail menu-detail"
    :class="themeClassName"
    :style="themeStyleVars"
  >
    <MenuDetailStructured
      :view="interaction.structured.view"
      :pending="pending"
      :error="error"
      @update:selected-choice="interaction.structured.select"
      @add="interaction.structured.add"
      @remove="interaction.structured.remove"
    />

    <MenuDetailOrderingFunnel
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
import { useMenuOrdering } from './Ordering/useMenuOrdering'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

const {
  pending,
  error,
  structuredMenu,
} = useMenuManifest(() => props.menuId, {
  kitchenSlug: () => props.kitchenSlug,
})
const pageStyle = computed(() =>
  structuredMenu.value?.presentation.pageStyle || null
)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({ pageStyle })
const interaction = useMenuOrdering({
  menu: structuredMenu,
  menuId: () => props.menuId,
  kitchenSlug: () => props.kitchenSlug,
})
</script>
