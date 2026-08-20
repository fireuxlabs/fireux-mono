<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw workspace debug label. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: delegate selected-target chrome to Core. -->
<template>
  <WorkspaceSelectedTarget
    label="Portfolio"
    :selected-id="portfolioId"
    :description="portfolioName"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioWorkspaceEntity } from '../../../composables/workspace/core/usePortfolioWorkspace'

const props = defineProps<{
  portfolio?: PortfolioWorkspaceEntity | null
  portfolioId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const portfolioName = computed(() =>
  String(props.portfolio?.name || props.portfolio?.slug || '').trim()
)
</script>
