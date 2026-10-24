<template>
  <Summary
    title="Compliance records"
    icon="i-lucide-shield-check"
    to="/workspace/portfolio/compliance"
    :value="settled ? compliance.count.value : '—'"
    :pending="compliance.outcome.value === 'pending'"
    :error="compliance.outcome.value === 'error'"
    :description="
      settled
        ? `${compliance.overdueCount.value} past their recorded expiry date`
        : ''
    "
  />
</template>
<script setup lang="ts">
import { usePortfolioScope } from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import { usePortfolioWorkspace } from 'fireux-properties/runtime/portfolio/composables/workspace/usePortfolioWorkspace'

import { computed } from 'vue'
import Summary from 'fireux-core/runtime/workspace/components/Overview/Summary.vue'
import { usePortfolioComplianceRecordCollection } from '../../../composables/usePortfolioComplianceRecordCollection'
const compliance = usePortfolioComplianceRecordCollection(
  usePortfolioScope(usePortfolioWorkspace().id)
)
const settled = computed(
  () =>
    compliance.outcome.value === 'ready' || compliance.outcome.value === 'empty'
)
</script>
