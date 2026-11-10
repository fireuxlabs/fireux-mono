<template>
  <WorkspaceAI aria-label="KitchenAI · Menus" compact>
    <p v-if="message" role="status">
      {{ message }}
    </p>
    <FireCopyError v-if="error" :message="error" />
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="Boolean(ready && prompt.trim() && !submitting)"
      :submitting="submitting"
      placeholder="Help me finish setting up food and services…"
      aria-label="Ask KitchenAI about Menus"
      :suggestions="suggestions"
      :model-label="developmentModelLabel"
      @submit="ask"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>
<script setup lang="ts">
import { useMenuGroupIndexContext } from '../../composables/workspace/menu-group/useMenuGroupIndexContext'
import { useFoodOverviewAI } from '../../composables/workspace/menu-group/useFoodOverviewAI'
const { kitchenId, ready, overview } = useMenuGroupIndexContext()
const { prompt, message, error, submitting, ask } = useFoodOverviewAI({
  kitchenId,
  ready,
  overview,
})
const suggestions = [
  { label: 'Help me finish service setup' },
  { label: 'Help me fix Collection hours' },
  { label: 'Help me finish a Menu' },
]
const developmentModelLabel = import.meta.dev
  ? 'FireUX · Codex development'
  : undefined
</script>
