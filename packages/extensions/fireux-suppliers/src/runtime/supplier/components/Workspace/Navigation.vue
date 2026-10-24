<template>
  <div v-if="identityOnly && selected" class="flex min-w-0 items-center gap-2">
    <UAvatar
      v-bind="item.avatar"
      :alt="item.label"
      :icon="item.icon"
      size="2xs"
    />
    <span class="truncate text-sm font-medium">{{ item.label }}</span>
  </div>
  <WorkspaceEntitySwitcher
    v-else-if="!identityOnly && !backdropOnly"
    :item="item"
    :to="workspaceEntryPath"
    :collapsed="collapsed"
    :pending="
      workspace.collectionOutcome.value === 'pending' ||
      workspace.collectionOutcome.value === 'idle'
    "
    workspace-label="Supplier"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AvatarProps } from '@nuxt/ui'
import type { SupplierCard } from '../../composables/firestore/utils/view/useSupplierInterface'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/workspace/components/EntitySwitcher.vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { useSupplierInterface } from '../../composables/firestore/utils/view/useSupplierInterface'
import { useSupplierWorkspace } from '../../composables/workspace/useSupplierWorkspace'

withDefaults(
  defineProps<{
    collapsed?: boolean
    identityOnly?: boolean
    backdropOnly?: boolean
  }>(),
  { collapsed: false, identityOnly: false, backdropOnly: false }
)

const { workspaceEntryPath } = useWorkspaceEntryCta('supplier')
const workspace = useSupplierWorkspace()
const { pill } = useSupplierInterface()
const selected = computed(() =>
  workspace.collection.value.find(
    (supplier) => supplier.id === workspace.id.value
  )
)
const card = computed(() => pill(selected.value))
function avatar(card?: SupplierCard.Card | null): AvatarProps {
  return {
    src: card?.imageUrl || undefined,
    alt: card?.title || 'Supplier',
    icon: 'i-lucide-truck',
    ...(card?.imageFit === 'contain'
      ? {
          class: 'rounded-md overflow-hidden',
          style: card.imageBackground
            ? { backgroundColor: card.imageBackground }
            : undefined,
          ui: { image: 'object-contain p-0.5' },
        }
      : {}),
  }
}
const item = computed(() => ({
  label:
    workspace.collectionOutcome.value === 'error'
      ? 'Suppliers unavailable'
      : card.value?.title || workspace.id.value || 'Supplier Workspace',
  avatar: avatar(
    workspace.collectionOutcome.value === 'ready' ? card.value : null
  ),
  icon:
    workspace.collectionOutcome.value === 'error'
      ? 'i-lucide-triangle-alert'
      : 'i-lucide-truck',
  choices:
    workspace.collectionOutcome.value === 'ready' &&
    workspace.collection.value.length > 1
      ? workspace.collection.value.flatMap((supplier) => {
          const identity = pill(supplier)
          if (!identity) return []
          return [
            {
              label: identity.title,
              avatar: avatar(identity),
              onSelect: () => workspace.select(identity.id),
            },
          ]
        })
      : [],
}))
</script>
