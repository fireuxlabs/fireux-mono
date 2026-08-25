<template>
  <WorkspaceCurrentEntity
    label="Kitchen"
    :selected-id="kitchen.id"
    :entity="entity"
    :changeable="false"
    icon="i-lucide-chef-hat"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceEntityCard } from 'fireux-core/runtime/components/Workspace/types'
import type { KitchenSurface } from '../../../composables/firestore/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../composables/firestore/utils/view/useKitchenInterface'

const props = defineProps<{ kitchen: KitchenSurface }>()
const { workspaceTarget } = useKitchenInterface()

const entity = computed<WorkspaceEntityCard>(() => {
  const card = workspaceTarget(props.kitchen)
  const title =
    card?.name ||
    String(
      props.kitchen.display_name ||
        props.kitchen.name ||
        props.kitchen.slug ||
        'Kitchen'
    ).trim()
  const address =
    card?.shortAddress ||
    String(
      props.kitchen.short_address || props.kitchen.formatted_address || ''
    ).trim()
  const tagline = String(props.kitchen.tagline || '').trim()

  return {
    id: props.kitchen.id,
    title,
    subtitle: tagline || address,
    meta: tagline && address ? address : undefined,
    imageUrl: card?.imageUrl,
    imageAlt: `${title} identity`,
    imageFit: 'contain',
    imageBackground: card?.mediaBackdropColor,
    icon: 'i-lucide-chef-hat',
    badges: card?.badges,
  }
})
</script>
