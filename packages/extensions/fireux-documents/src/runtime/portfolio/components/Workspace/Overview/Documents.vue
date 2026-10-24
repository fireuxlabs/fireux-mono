<template>
  <Summary
    title="Documents"
    icon="i-lucide-files"
    to="/workspace/portfolio/documents"
    :value="settled ? documents.count.value : '—'"
    :pending="outcome === 'pending'"
    :error="outcome === 'error'"
    :description="settled ? `${links.count.value} document links` : ''"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Summary from 'fireux-core/runtime/workspace/components/Overview/Summary.vue'
import { useActivePortfolio } from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { usePortfolioDocuments } from '../../../composables/documents/usePortfolioDocuments'
import { usePortfolioDocumentLinks } from '../../../composables/documents/usePortfolioDocumentLinks'
const portfolio = useActivePortfolio()
const documents = usePortfolioDocuments(portfolio)
const links = usePortfolioDocumentLinks(portfolio)
const outcome = computed(() =>
  portfolio.targetOutcome.value !== 'ready'
    ? portfolio.targetOutcome.value
    : resolveReadOutcome({
        active: portfolio.canRead.value,
        pending:
          documents.outcome.value === 'pending' ||
          links.outcome.value === 'pending',
        error: documents.error.value || links.error.value,
        kind: 'collection',
        present: documents.count.value > 0,
      })
)
const settled = computed(
  () => outcome.value === 'ready' || outcome.value === 'empty'
)
</script>
