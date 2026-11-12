<template>
  <WorkspacePageHeader
    title="Menus"
    :description="description"
    variant="primary"
  />
  <KitchenMenuMenusOverview />
  <KitchenMenuMenusCreateDialog />
  <KitchenMenuAI />
  <section
    class="menu-summary"
    aria-label="Items, promotions and services summary"
  >
    <KitchenMenuItemsOverview />
    <KitchenMenuPromotionsOverview />
    <KitchenMenuServicesOverview />
  </section>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import { provideMenuGroupIndex } from '../../composables/workspace/menu-group/useMenuGroupIndexContext'
import { provideKitchenMenusContext } from '../../composables/workspace/menus/useKitchenMenusContext'
import { useRoute, useRouter } from '#imports'
const route = useRoute(),
  router = useRouter()
const menus = provideKitchenMenusContext(false)
const { kitchenName } = provideMenuGroupIndex(menus.menuCollection)
watch(
  () => [route.query.create, menus.canCreateMenu.value],
  () => {
    if (route.query.create !== '1' || !menus.canCreateMenu.value) return
    menus.actions.openCreate()
    void router.replace({ query: { ...route.query, create: undefined } })
  },
  { immediate: true }
)
const description = computed(
  () =>
    `Manage ${kitchenName.value ? `${kitchenName.value}'s` : "your Kitchen's"} menus, items, promotions and services`
)
</script>

<style scoped>
.menu-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
  gap: calc(var(--spacing) * 3);
  align-items: start;
}
</style>
