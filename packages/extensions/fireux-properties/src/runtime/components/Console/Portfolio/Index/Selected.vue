<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw console debug label. -->
<template>
  <section class="space-y-2">
    <UPageCard
      v-if="portfolioId"
      :title="selectedTitle"
      :description="portfolioName || portfolioId"
      variant="subtle"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          @click="emit('clear')"
        >
          Clear
        </UButton>
      </template>
    </UPageCard>

    <UPageCard
      v-else
      title="No selected Portfolio"
      description="Choose a Portfolio target to open selected Portfolio console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioConsoleEntity } from '../../../../composables/fireux/console/portfolio/core/usePortfolioConsole'

const props = defineProps<{
  portfolio?: PortfolioConsoleEntity | null
  portfolioId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const portfolioName = computed(() =>
  String(props.portfolio?.name || props.portfolio?.slug || '').trim()
)
const selectedTitle = 'Selected Portfolio'
</script>
