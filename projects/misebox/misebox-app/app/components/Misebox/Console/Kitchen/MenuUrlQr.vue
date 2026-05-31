<template>
  <UCard
    variant="subtle"
    class="w-full"
  >
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold text-highlighted">
          Create menu URL QR
        </h2>
        <p class="text-sm text-muted">
          Use an existing online menu link for this kitchen.
        </p>
      </div>
    </template>

    <UAlert
      v-if="!selectedKitchen"
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a live kitchen before creating a menu URL QR."
    />

    <MiseboxGoQrUrlEmbed
      v-else
      :description="description"
      url-placeholder="https://my-url.com/menu"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenus } from 'fireux-kitchens/runtime/composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'

const { selectedKitchen } = useKitchenConsoleMenus()

const kitchenName = computed(() =>
  String((selectedKitchen.value as any)?.display_name || selectedKitchen.value?.name || 'this kitchen').trim()
)
const description = computed(() =>
  `Paste an existing online menu URL for ${kitchenName.value} and get a printable QR menu.`
)
</script>
