<template>
  <section class="grid gap-1" aria-labelledby="kitchen-selector-title">
    <p id="kitchen-selector-title" class="px-2 text-sm font-medium text-muted">
      Choose a Kitchen
    </p>
    <UTabs
      :model-value="selectedKitchenId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="selectKitchen"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenWorkspaceIndexState } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenWorkspaceSelection } from '../../composables/workspace/core/useKitchenWorkspaceSelection'

const props = defineProps<{
  kitchens: KitchenWorkspaceIndexState['kitchens']
  selectedKitchenId: string
}>()

const { setKitchenWorkspaceSelection } = useKitchenWorkspaceSelection()
const items = computed(() =>
  props.kitchens.map((kitchen) => ({
    label: kitchen.name,
    value: kitchen.id,
    avatar: {
      src: kitchen.url || undefined,
      alt: kitchen.name,
      icon: 'i-lucide-chef-hat',
    },
  }))
)

function selectKitchen(kitchenId: string | number) {
  const kitchen = props.kitchens.find((item) => item.id === kitchenId)
  if (!kitchen) return
  setKitchenWorkspaceSelection({
    kitchenId: kitchen.id,
    name: kitchen.name,
    tagline: kitchen.tagline,
    url: kitchen.url,
  })
}
</script>
