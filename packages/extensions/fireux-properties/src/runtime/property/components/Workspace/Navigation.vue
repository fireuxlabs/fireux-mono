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
    :pending="
      workspace.collectionOutcome.value === 'pending' ||
      workspace.collectionOutcome.value === 'idle'
    "
    workspace-label="Property"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/workspace/components/EntitySwitcher.vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { usePropertyInterface } from '../../composables/firestore/utils/view/usePropertyInterface'
import { usePropertyWorkspace } from '../../composables/workspace/usePropertyWorkspace'

withDefaults(
  defineProps<{
    collapsed?: boolean
    identityOnly?: boolean
    backdropOnly?: boolean
  }>(),
  { collapsed: false, identityOnly: false, backdropOnly: false }
)

const { workspaceEntryPath } = useWorkspaceEntryCta('property')
const workspace = usePropertyWorkspace()
const { pill } = usePropertyInterface()
const selected = computed(() =>
  workspace.collection.value.find(
    (property) => property.id === workspace.id.value
  )
)
const card = computed(() => pill(selected.value))
const item = computed(() => ({
  label:
    workspace.collectionOutcome.value === 'error'
      ? 'Properties unavailable'
      : card.value?.title || workspace.id.value || 'Property Workspace',
  image:
    workspace.collectionOutcome.value === 'ready' ? card.value?.imageUrl : '',
  icon:
    workspace.collectionOutcome.value === 'error'
      ? 'i-lucide-triangle-alert'
      : 'i-lucide-building-2',
  choices:
    workspace.collectionOutcome.value === 'ready' &&
    workspace.collection.value.length > 1
      ? workspace.collection.value.flatMap((property) => {
          const identity = pill(property)
          if (!identity) return []
          return [
            {
              label: identity.title,
              avatar: {
                src: identity.imageUrl || undefined,
                alt: identity.title,
                icon: 'i-lucide-building-2',
              },
              onSelect: () => workspace.select(identity.id),
            },
          ]
        })
      : [],
}))
</script>
