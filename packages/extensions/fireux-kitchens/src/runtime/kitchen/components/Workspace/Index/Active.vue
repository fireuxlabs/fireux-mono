<template>
  <WorkspaceActiveEntity
    label="Kitchen"
    :active-id="draft ? '' : kitchen.id"
    :entity="entity"
    :changeable="false"
    :sparse="draft"
    icon="i-lucide-chef-hat"
  >
    <template v-if="showKitchensAction" #actions>
      <UButton
        :label="kitchensOpen ? 'Hide Kitchens' : 'Kitchens'"
        :icon="kitchensOpen ? 'i-lucide-chevron-up' : 'i-lucide-repeat-2'"
        color="neutral"
        variant="soft"
        size="sm"
        @click="emit('toggle-kitchens')"
      />
    </template>
  </WorkspaceActiveEntity>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceEntityCard } from 'fireux-core/runtime/components/Workspace/types'
import type { KitchenSurface } from '../../../composables/firestore/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../composables/firestore/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    kitchen: KitchenSurface
    draft?: boolean
    showKitchensAction?: boolean
    kitchensOpen?: boolean
  }>(),
  {
    draft: false,
    showKitchensAction: false,
    kitchensOpen: false,
  }
)
const emit = defineEmits<{
  (event: 'toggle-kitchens'): void
}>()
const { workspaceTarget } = useKitchenInterface()

const entity = computed<WorkspaceEntityCard>(() => {
  const card = workspaceTarget(props.kitchen)
  const persistedTitle =
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
  const title = props.draft
    ? String(props.kitchen.name || '').trim() || tagline
    : persistedTitle

  return {
    id: String(props.kitchen.id || '').trim(),
    title,
    subtitle: props.draft
      ? String(props.kitchen.name || '').trim()
        ? tagline || address
        : address
      : tagline || address || 'My Kitchen',
    meta: tagline && address ? address : undefined,
    imageUrl: card?.imageUrl,
    imageAlt: `${title} identity`,
    imageFit: 'contain',
    imageBackground: card?.mediaBackdropColor,
    icon: props.draft ? undefined : 'i-lucide-chef-hat',
  }
})
</script>
