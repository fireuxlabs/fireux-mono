<template>
  <section class="menu-settings">
    <div class="menu-settings__body">
      <KitchenFoodAndDrinkMenusEditDetails />
      <KitchenFoodAndDrinkMenusDetailSummary />
    </div>
    <KitchenFoodAndDrinkMenusDetailAudience />
    <KitchenFoodAndDrinkMenusDetailHours />
    <KitchenFoodAndDrinkMenusDetailOfferings />
    <UButton
      to="/workspace/kitchen/food-and-drink/promotions"
      label="Promotions"
      icon="i-lucide-badge-percent"
      color="neutral"
      variant="soft"
      class="menu-settings__link"
    />
    <WorkspaceKitchenContext
      v-if="menu && menu.schedule !== 'daily'"
      :key="`${kitchenId}/${menu.id}`"
      :kitchen-id="kitchenId"
      :menu-id="menu.id"
      subject="menu"
      title="Menu context"
      :can-write="canWrite"
    />
    <KitchenFoodAndDrinkMenusDetailRemove />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { kitchenId, menu, canWrite } = useKitchenMenuRecordContext()
</script>
<style scoped>
.menu-settings {
  width: 100%;
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.menu-settings__link {
  justify-self: start;
}
.menu-settings__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 17rem;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg);
  box-shadow: 0 8px 28px
    color-mix(in srgb, var(--ui-text-highlighted) 3%, transparent);
}
@media (max-width: 700px) {
  .menu-settings__link {
    justify-self: start;
  }
  .menu-settings__body {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
