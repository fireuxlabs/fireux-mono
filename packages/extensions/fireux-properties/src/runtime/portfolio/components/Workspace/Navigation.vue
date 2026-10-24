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
    workspace-label="Portfolio"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/workspace/components/EntitySwitcher.vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { usePortfolioInterface } from '../../composables/firestore/utils/view/usePortfolioInterface'
import { usePortfolioWorkspace } from '../../composables/workspace/usePortfolioWorkspace'

withDefaults(
  defineProps<{
    collapsed?: boolean
    identityOnly?: boolean
    backdropOnly?: boolean
  }>(),
  { collapsed: false, identityOnly: false, backdropOnly: false }
)

const { workspaceEntryPath } = useWorkspaceEntryCta('portfolio')
const workspace = usePortfolioWorkspace()
const { pill } = usePortfolioInterface()
const selected = computed(() =>
  workspace.collection.value.find(
    (portfolio) => portfolio.id === workspace.id.value
  )
)
const card = computed(() => pill(selected.value))
const item = computed(() => ({
  label:
    workspace.collectionOutcome.value === 'error'
      ? 'Portfolios unavailable'
      : card.value?.title || workspace.id.value || 'Portfolio Workspace',
  image:
    workspace.collectionOutcome.value === 'ready' ? card.value?.imageUrl : '',
  icon:
    workspace.collectionOutcome.value === 'error'
      ? 'i-lucide-triangle-alert'
      : 'i-lucide-building-2',
  choices:
    workspace.collectionOutcome.value === 'ready' &&
    workspace.collection.value.length > 1
      ? workspace.collection.value.flatMap((portfolio) => {
          const identity = pill(portfolio)
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
