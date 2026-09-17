<template>
  <WorkspaceAI aria-label="PortfolioAI" compact>
    <UChatPrompt
      v-model="prompt"
      placeholder="Tell us about your Portfolio…"
      variant="soft"
      aria-label="Ask PortfolioAI"
    >
      <template #footer>
        <div class="flex w-full items-center justify-between">
          <UButton
            type="button"
            icon="i-lucide-paperclip"
            color="neutral"
            variant="ghost"
            aria-label="Attach file"
            disabled
          />
          <UChatPromptSubmit status="ready" disabled />
        </div>
      </template>
    </UChatPrompt>
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const prompt = ref('')
</script>
