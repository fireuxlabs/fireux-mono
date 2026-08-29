<template>
  <WorkspaceAI aria-label="KitchenAI">
    <Messages
      v-if="state.messages.length"
      :messages="state.messages"
      @copy="actions.copyResult"
    />
    <Composer
      v-model="state.prompt"
      :placeholder="derived.placeholder"
      :submitting="derived.submitting"
      allow-file
      aria-label="Ask KitchenAI"
      @submit="actions.sendPrompt"
      @file="actions.stageFile"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import type { KitchenWorkspaceIndexState } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenAIIndex } from '../../composables/workspace/index/useKitchenAIIndex'
import Composer from './AI/Composer.vue'
import Messages from './AI/Messages.vue'

const props = defineProps<{
  kitchen: KitchenWorkspaceIndexState['kitchen']
}>()

const { state, derived, actions } = useKitchenAIIndex(() => props.kitchen)
</script>

<style src="./AI/welcome.css"></style>
