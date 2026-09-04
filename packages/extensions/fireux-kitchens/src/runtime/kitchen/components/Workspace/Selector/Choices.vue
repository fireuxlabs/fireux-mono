<template>
  <section v-if="items.length" aria-label="Kitchen choices">
    <UTabs
      :model-value="kitchen.id"
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
import type { KitchenWorkspaceIndexState } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenWorkspace } from '../../../composables/workspace/core/useKitchenWorkspace'

const props = defineProps<{
  kitchen: KitchenWorkspaceIndexState['kitchen']
  kitchenIds: string[]
  canSelectMultiple: boolean
}>()
const workspace = useKitchenWorkspace()
const showChoices = computed(
  () => props.canSelectMultiple || props.kitchenIds.length > 1
)
const kitchens = computed(() =>
  showChoices.value
    ? workspace.choices.value.map((item) => ({
        id: item.id,
        name: item.name,
        tagline: item.description,
        url: item.image,
      }))
    : props.kitchen.id
      ? [props.kitchen]
      : []
)
const items = computed(() =>
  kitchens.value.map((item) => ({
    label: item.name || item.id,
    value: item.id,
    avatar: {
      src: item.url || undefined,
      alt: item.name,
      icon: 'i-lucide-chef-hat',
    },
  }))
)

async function selectKitchen(kitchenId: string | number) {
  const selected = kitchens.value.find((item) => item.id === kitchenId)
  if (!selected || selected.id === props.kitchen.id) return
  await workspace.select(selected.id)
}
</script>
