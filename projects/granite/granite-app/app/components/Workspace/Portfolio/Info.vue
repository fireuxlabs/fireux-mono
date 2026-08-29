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
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div class="grid gap-5">
          <p class="m-0 text-sm text-toned">
            Operate one property Portfolio through its properties, compliance,
            documents, tasks and financial signals.
          </p>
          <p class="m-0 text-sm text-muted">
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
