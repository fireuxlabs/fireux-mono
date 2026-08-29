<template>
  <section aria-label="Kitchen selector">
    <UTabs
      :model-value="selectedEntityId"
      :items="visibleItems"
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
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { KitchenWorkspaceIndexState } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenWorkspaceSelection } from '../../composables/workspace/core/useKitchenWorkspaceSelection'

const props = defineProps<{
  kitchens: KitchenWorkspaceIndexState['kitchens']
  selectedEntityId: string
  primaryKitchenId: string
  canSelectMultiple: boolean
  refresh: () => Promise<unknown>
}>()

const { setKitchenWorkspaceSelection } = useKitchenWorkspaceSelection()
const { currentUser } = useAuth()
const items = computed(() =>
  props.kitchens.map((kitchen) => ({
    label: kitchen.name || kitchen.id,
    value: kitchen.id,
    avatar: {
      src: kitchen.url || undefined,
      alt: kitchen.name,
      icon: 'i-lucide-chef-hat',
    },
  }))
)
const visibleItems = computed(() => {
  if (props.canSelectMultiple) return items.value
  const primaryId = props.primaryKitchenId || props.selectedEntityId
  return items.value.filter((item) => item.value === primaryId)
})

async function selectKitchen(kitchenId: string | number) {
  const kitchen = props.kitchens.find((item) => item.id === kitchenId)
  if (!kitchen) return
  const user = currentUser.value
  if (props.canSelectMultiple && user) {
    await $fetch('/api/workspace/kitchen/request-primary-change', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: { kitchenId: kitchen.id },
    })
    await props.refresh()
  }
  setKitchenWorkspaceSelection({
    kitchenId: kitchen.id,
    name: kitchen.name,
    tagline: kitchen.tagline,
    url: kitchen.url,
  })
}
</script>
