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
import { computed, watchEffect } from 'vue'
import { useToast } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import type { KitchenWorkspaceIndexState } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenWorkspaceChoices } from '../../../composables/workspace/index/useKitchenWorkspaceChoices'

const props = defineProps<{
  kitchen: KitchenWorkspaceIndexState['kitchen']
  kitchenIds: string[]
  canSelectMultiple: boolean
  refresh: () => Promise<unknown>
}>()
const workspace = useWorkspace('kitchen')
const { currentUser } = useAuth()
const toast = useToast()
const showChoices = computed(
  () => props.canSelectMultiple || props.kitchenIds.length > 1
)
const targets = useKitchenWorkspaceChoices(showChoices, () => props.kitchenIds)
const kitchens = computed(() =>
  showChoices.value
    ? targets.kitchens.value.map((item) => ({
        id: item.id,
        name: item.identity.display_name,
        tagline: item.identity.tagline,
        url: item.identity.image_url,
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

watchEffect(() => {
  workspace.setChoices(
    kitchens.value.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.tagline,
      image: item.url,
    }))
  )
})

async function selectKitchen(kitchenId: string | number) {
  const selected = kitchens.value.find((item) => item.id === kitchenId)
  if (!selected || selected.id === props.kitchen.id) return
  const user = currentUser.value
  if (!user) return
  const response = await $fetch<{ updated?: true; notified: number }>(
    '/api/workspace/kitchen/request-primary-change',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: { kitchenId: selected.id },
    }
  )
  if (response.updated) {
    await props.refresh()
    await targets.refresh()
    return
  }
  toast.add({
    title: 'Primary Kitchen change requested',
    description: 'An App administrator has been notified.',
  })
}
</script>
