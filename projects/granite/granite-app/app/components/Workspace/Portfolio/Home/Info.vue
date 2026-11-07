<template>
  <div>
    <UButton
      icon="i-lucide-info"
      color="neutral"
      variant="ghost"
      size="sm"
      aria-label="About this Portfolio Workspace"
      @click="open = true"
    />

    <UModal
      v-model:open="open"
      title="Portfolio Workspace"
      description="How this page and PortfolioAI fit together."
    >
      <template #body>
        <div class="pagebody">
          <p class="fx-type-caption">
            Operate one property Portfolio through its properties, compliance,
            documents, tasks and financial signals.
          </p>
          <p class="fx-type-caption">
            PortfolioAI actions are not connected yet.
          </p>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>
