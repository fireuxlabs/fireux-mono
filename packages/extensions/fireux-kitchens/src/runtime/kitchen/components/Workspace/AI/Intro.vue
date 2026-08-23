<template>
  <div class="kitchen-ai-welcome__intro">
    <div class="kitchen-ai-welcome__mark" aria-hidden="true">
      <UIcon :name="contextIcon" />
      <span v-if="hasContextIcon" class="kitchen-ai-welcome__mark-ai">
        <UIcon name="i-lucide-sparkles" />
      </span>
    </div>
    <p v-if="agentLabel" class="fx-type-label">{{ agentLabel }}</p>
    <h1 id="kitchen-ai-title" class="fx-type-display-title" v-text="title" />
    <p v-if="description" class="fx-type-description text-toned">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  agentLabel: string
  contextIcon: string
  hasContextIcon: boolean
  title: string
  description: string
}>()
</script>
