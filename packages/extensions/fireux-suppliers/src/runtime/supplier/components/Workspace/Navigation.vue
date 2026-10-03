<template>
  <div v-if="identityOnly && selected" class="flex min-w-0 items-center gap-2">
    <UAvatar :src="item.image" :alt="item.label" :icon="item.icon" size="2xs" />
    <span class="truncate text-sm font-medium">{{ item.label }}</span>
  </div>
  <WorkspaceEntitySwitcher
    v-else-if="!identityOnly && !backdropOnly"
    :item="item"
    :to="workspaceEntryPath"
    :collapsed="collapsed"
    :pending="index.outcome.value === 'pending' || index.outcome.value === 'idle'"
    workspace-label="Supplier"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/components/Workspace/EntitySwitcher.vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { useSupplierInterface } from '../../composables/firestore/utils/view/useSupplierInterface'
import { useSupplierWorkspaceIndex } from '../../composables/workspace/useSupplierWorkspaceIndex'

withDefaults(defineProps<{
  collapsed?: boolean
  identityOnly?: boolean
  backdropOnly?: boolean
}>(), { collapsed: false, identityOnly: false, backdropOnly: false })

const { workspaceEntryPath } = useWorkspaceEntryCta('supplier')
const index = useSupplierWorkspaceIndex()
const { pill } = useSupplierInterface()
const selected = computed(() => index.collection.value.find(
  (supplier) => supplier.id === index.selectedId.value
))
const card = computed(() => pill(selected.value))
const item = computed(() => ({
  label: index.outcome.value === 'error'
    ? 'Suppliers unavailable'
    : card.value?.title || index.selectedId.value || 'Supplier Workspace',
  image: index.outcome.value === 'ready' ? card.value?.imageUrl : '',
  icon: index.outcome.value === 'error' ? 'i-lucide-triangle-alert' : 'i-lucide-truck',
  choices: index.outcome.value === 'ready' && index.collection.value.length > 1
    ? index.collection.value.flatMap((supplier) => {
        const identity = pill(supplier)
        if (!identity) return []
        return [{
          label: identity.title,
          avatar: { src: identity.imageUrl || undefined, alt: identity.title, icon: 'i-lucide-truck' },
          onSelect: () => index.select(identity.id),
        }]
      })
    : [],
}))
</script>
