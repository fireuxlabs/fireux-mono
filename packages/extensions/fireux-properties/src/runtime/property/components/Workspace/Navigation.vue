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
    workspace-label="Property"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/components/Workspace/EntitySwitcher.vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { usePropertyInterface } from '../../composables/firestore/utils/view/usePropertyInterface'
import { usePropertyWorkspaceIndex } from '../../composables/workspace/usePropertyWorkspaceIndex'

withDefaults(defineProps<{
  collapsed?: boolean
  identityOnly?: boolean
  backdropOnly?: boolean
}>(), { collapsed: false, identityOnly: false, backdropOnly: false })

const { workspaceEntryPath } = useWorkspaceEntryCta('property')
const index = usePropertyWorkspaceIndex()
const { pill } = usePropertyInterface()
const selected = computed(() => index.collection.value.find(
  (property) => property.id === index.selectedId.value
))
const card = computed(() => pill(selected.value))
const item = computed(() => ({
  label: index.outcome.value === 'error'
    ? 'Propertys unavailable'
    : card.value?.title || index.selectedId.value || 'Property Workspace',
  image: index.outcome.value === 'ready' ? card.value?.imageUrl : '',
  icon: index.outcome.value === 'error' ? 'i-lucide-triangle-alert' : 'i-lucide-building-2',
  choices: index.outcome.value === 'ready' && index.collection.value.length > 1
    ? index.collection.value.flatMap((property) => {
        const identity = pill(property)
        if (!identity) return []
        return [{
          label: identity.title,
          avatar: { src: identity.imageUrl || undefined, alt: identity.title, icon: 'i-lucide-building-2' },
          onSelect: () => index.select(identity.id),
        }]
      })
    : [],
}))
</script>
