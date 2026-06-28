<template>
  <section class="fireux-menu-detail menu-detail">
    <MenuDetailStructured
      :view="ordering.structured.view"
      :pending="pending"
      :error="error"
      @update:selected-choice="ordering.structured.select"
      @add="ordering.structured.add"
      @remove="ordering.structured.remove"
    />

    <MenuDetailOrderingLayer
      v-if="ordering.layer.show"
      :order="ordering.layer.order"
      @clear="ordering.layer.clear"
      @close-funnel="ordering.layer.close"
      @open-funnel="ordering.layer.open"
      @submit="ordering.layer.submit"
    />

    <p
      v-if="ordering.status.message || ordering.status.error"
      class="menu-detail__order-state"
      aria-live="polite"
    >
      {{ ordering.status.message || ordering.status.error }}
    </p>
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
const ordering = useMenuOrdering({
  menu: structuredMenu,
  menuId,
  kitchenSlug,
})
</script>

<style scoped>
.menu-detail__order-state {
  justify-self: center;
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 800;
}
</style>
