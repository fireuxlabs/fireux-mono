<template>
  <section
    class="fireux-menu-detail menu-detail"
    :class="themeClassName"
    :style="themeStyleVars"
  >
    <MenuDetailStructured
      :view="ordering.structured.view"
      :pending="pending"
      :error="error"
      @update:selected-choice="ordering.structured.select"
      @add="ordering.structured.add"
      @remove="ordering.structured.remove"
    />

    <MenuDetailOrderingFunnel
      v-if="ordering.funnel.show"
      :order="ordering.funnel.order"
      @clear="ordering.funnel.clear"
      @close-panel="ordering.funnel.close"
      @open-panel="ordering.funnel.open"
      @submit="ordering.funnel.submit"
    />
  </section>

  <DevJson
    title="Menu debug"
    context="MenuDetail · Menu/Detail/Index.vue"
    :data="debug"
  />
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

const menuId = computed(() => props.menuId)
const kitchenSlug = computed(() => props.kitchenSlug)
// Public detail spine: keep the active menu doorway boring first. Document/theme rendering is parked until the structured path is clean.
const {
  pending,
  error,
  structuredMenu,
  debug,
} = useMenuManifest(menuId, { kitchenSlug })
const pageStyle = computed(() =>
  structuredMenu.value?.presentation.pageStyle || null
)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({ pageStyle })
const ordering = useMenuOrdering({
  menu: structuredMenu,
  menuId,
  kitchenSlug,
})
</script>
