<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/dishes"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to dishes
    </UButton>

    <DishProfile
      v-if="dish"
      :dish="dish"
      :menu-usage="menuUsage"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading dish' : 'Dish not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen dish.'
          : `No dish was found for ${dishId || 'this route'}.`
      "
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen dish detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleDish } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDish'
import DishProfile from '../../../Dish/Cards/Profile.vue'

const { dish, dishId, menuUsage, pending, debug } = useKitchenConsoleDish()
const isDev = import.meta.dev
</script>
