<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw console debug label. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: delegate selected-target chrome to Core. -->
<template>
  <ConsoleSelectedTarget
    label="Portfolio"
    :selected-id="portfolioId"
    :description="portfolioName"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioConsoleEntity } from '../../../composables/console/core/usePortfolioConsole'

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
</script>
