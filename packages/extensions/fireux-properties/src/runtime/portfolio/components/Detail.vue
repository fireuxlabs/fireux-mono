<template>
  <div class="space-y-4">
    <PortfolioCardsProfile v-if="profileCard" :card="profileCard" />
    <PortfolioPublicOperatorPanel :portfolio="portfolio" />
    <DevDebugPanel
      title="Portfolio detail surface"
      context="Passed Portfolio and its derived profile card."
      object-origin="passed"
      :objects="{ portfolio }"
      :derived="{ profileCard }"
      launcher
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioPublicSummary } from '../models/portfolio-read.model'
import { usePortfolioSeo } from '../composables/usePortfolioSeo'
import { usePortfolioInterface } from '../composables/firestore/utils/view/usePortfolioInterface'

const props = defineProps<{ portfolio: PortfolioPublicSummary }>()
const { profile } = usePortfolioInterface()
const profileCard = computed(() => profile(props.portfolio))

usePortfolioSeo(computed(() => props.portfolio))
</script>
