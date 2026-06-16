<template>
  <EntityOperatorPanel
    entity-label="Portfolio"
    title="Portfolio Operations"
    :description="panelDescription"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioSurface } from '../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

const props = defineProps<{
  portfolio?: PortfolioSurface | null
}>()

const aligned = ['Identity', 'Document', 'Task', 'Compliance']
const notAligned = ['Client', 'Property', 'Unit']
const portfolioName = computed(() =>
  String(props.portfolio?.name || props.portfolio?.slug || '').trim()
)
const panelDescription = computed(() =>
  portfolioName.value
    ? `Portfolio operators manage documents, tasks, compliance, and private portfolio work for ${portfolioName.value}.`
    : 'Portfolio operators manage documents, tasks, compliance, and private portfolio work from the portfolio console.'
)
</script>
