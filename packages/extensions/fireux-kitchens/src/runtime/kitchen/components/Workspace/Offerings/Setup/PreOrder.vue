<template>
  <WorkspaceKitchenOfferingsTiming
    v-for="config in editor.interactions"
    :key="config.type"
    :config="config"
    :disabled="disabled"
    :update-function="
      (changes) => editor.updateInteraction(config.type, changes)
    "
  />
</template>
<script setup lang="ts">
import { useKitchenServiceEditor } from '../../../../composables/offerings/useKitchenServiceEditor'
const { editor, disabled } = useKitchenServiceEditor()
</script>
