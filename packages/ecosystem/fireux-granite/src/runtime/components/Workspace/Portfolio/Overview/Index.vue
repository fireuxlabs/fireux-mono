<template>
  <PortfolioOverview>
    <template #capabilities>
      <section
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Portfolio records"
      >
        <DocumentsSummary />
        <TasksSummary />
        <ComplianceSummary />
      </section>
    </template>
  </PortfolioOverview>
</template>
<script setup lang="ts">
import PortfolioOverview from 'fireux-properties/runtime/portfolio/components/Workspace/Overview/Index.vue'
import DocumentsSummary from 'fireux-documents/runtime/portfolio/components/Workspace/Overview/Documents.vue'
import TasksSummary from 'fireux-tasks/runtime/portfolio/components/Workspace/Overview/Tasks.vue'
import ComplianceSummary from 'fireux-compliance/runtime/portfolio/components/Workspace/Overview/Compliance.vue'
</script>
