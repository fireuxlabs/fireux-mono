<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.menu"
    label="Menus"
    connected
    context-label="Menu"
  >
    <p v-if="message" role="status">
      {{ message }}
    </p>
    <FireCopyError v-if="error" :message="error" />
    <WorkspaceAIComposer
      spacious
      v-model="prompt"
      :can-submit="Boolean(ready && prompt.trim() && !submitting)"
      :submitting="submitting"
      placeholder="Help me finish setting up food and services…"
      aria-label="Ask KitchenAI about Menus"
      :suggestions="suggestions"
      @submit="ask"
      @select-suggestion="prompt = $event.label"
    >
      <template #model>
        <WorkspaceAIModelLabel :development-codex="developmentCodex" />
      </template>
    </WorkspaceAIComposer>
  </WorkspaceKitchenAIFocus>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceMenuAi } from '../../../composables/workspace/menu/ai'
const { prompt, message, error, submitting, ask, ready } =
  useKitchenWorkspaceMenuAi()
const suggestions = [
  { label: 'Help me finish service setup' },
  { label: 'Help me fix Collection hours' },
  { label: 'Help me finish a Menu' },
]
const developmentCodex = import.meta.dev
</script>
