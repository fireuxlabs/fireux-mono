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
    workspace-label="Portfolio"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceEntitySwitcher from 'fireux-core/runtime/workspace/components/EntitySwitcher.vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { usePortfolioInterface } from '../../composables/firestore/utils/view/usePortfolioInterface'
import { usePortfolioWorkspaceIndex } from '../../composables/workspace/usePortfolioWorkspaceIndex'

withDefaults(defineProps<{
  collapsed?: boolean
  identityOnly?: boolean
  backdropOnly?: boolean
}>(), { collapsed: false, identityOnly: false, backdropOnly: false })

const { workspaceEntryPath } = useWorkspaceEntryCta('portfolio')
const index = usePortfolioWorkspaceIndex()
const { pill } = usePortfolioInterface()
const selected = computed(() => index.collection.value.find(
  (portfolio) => portfolio.id === index.selectedId.value
))
const card = computed(() => pill(selected.value))
const item = computed(() => ({
  label: index.outcome.value === 'error'
    ? 'Portfolios unavailable'
    : card.value?.title || index.selectedId.value || 'Portfolio Workspace',
  image: index.outcome.value === 'ready' ? card.value?.imageUrl : '',
  icon: index.outcome.value === 'error' ? 'i-lucide-triangle-alert' : 'i-lucide-building-2',
  choices: index.outcome.value === 'ready' && index.collection.value.length > 1
    ? index.collection.value.flatMap((portfolio) => {
        const identity = pill(portfolio)
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
