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
import { computed } from 'vue'
import Summary from 'fireux-core/runtime/workspace/components/Overview/Summary.vue'
import { usePortfolioComplianceRecordCollection } from '../../../composables/usePortfolioComplianceRecordCollection'
const compliance = usePortfolioComplianceRecordCollection()
const settled = computed(
  () =>
    compliance.outcome.value === 'ready' || compliance.outcome.value === 'empty'
)
</script>
