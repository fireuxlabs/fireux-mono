<template>
  <AppToolFoldaway
    title="Create menu URL QR"
    description="Use an existing online menu link for this kitchen."
    provider="Go QR"
    :open="open"
  >
    <UAlert
      v-if="!selectedKitchen"
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a live kitchen before creating a menu URL QR."
    />

    <ProviderGoQrUrlTool
      v-else
      :description="description"
      url-placeholder="https://my-url.com/menu"
    />
  </AppToolFoldaway>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenus } from 'fireux-kitchens/runtime/composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'

const { selectedKitchen } = useKitchenConsoleMenus()

withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: false,
})

const kitchenName = computed(() =>
  String((selectedKitchen.value as any)?.display_name || selectedKitchen.value?.name || 'this kitchen').trim()
)
const description = computed(() =>
  `Paste an existing online menu URL for ${kitchenName.value} and get a printable QR menu.`
)
</script>
