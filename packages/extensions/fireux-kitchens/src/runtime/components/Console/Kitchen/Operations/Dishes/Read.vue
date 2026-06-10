<template>
  <div class="space-y-6">
    <DishCollectionManager
      :collection="dishes"
      :menu-filters="menuFilters"
      :section-filters="sectionFilters"
      title="Dishes"
      description="Browse dishes for the selected kitchen."
      :link="true"
    />

    <DevFireuxDebugPanel
      title="Kitchen dishes"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/Operations/Dishes/useKitchenConsoleDishes'

const {
  dishes,
  menuFilters,
  sectionFilters,
  debug,
} = useKitchenConsoleDishes()
</script>
