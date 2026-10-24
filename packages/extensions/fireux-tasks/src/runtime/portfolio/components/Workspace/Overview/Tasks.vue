<template>
  <Summary
    title="Tasks"
    icon="i-lucide-list-checks"
    to="/workspace/portfolio/tasks"
    :value="settled ? openCount : '—'"
    :pending="tasks.outcome.value === 'pending'"
    :error="tasks.outcome.value === 'error'"
    :description="
      settled ? `${tasks.count.value} tasks · open or in progress shown` : ''
    "
  />
</template>
<script setup lang="ts">
import { usePortfolioScope } from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import { usePortfolioWorkspace } from 'fireux-properties/runtime/portfolio/composables/workspace/usePortfolioWorkspace'

import { computed } from 'vue'
import Summary from 'fireux-core/runtime/workspace/components/Overview/Summary.vue'
import { usePortfolioTaskCollection } from '../../../composables/usePortfolioTaskCollection'
const tasks = usePortfolioTaskCollection(
  usePortfolioScope(usePortfolioWorkspace().id)
)
const settled = computed(
  () => tasks.outcome.value === 'ready' || tasks.outcome.value === 'empty'
)
const openCount = computed(
  () =>
    tasks.collection.value.filter(
      (task) => task.status === 'open' || task.status === 'in_progress'
    ).length
)
</script>
