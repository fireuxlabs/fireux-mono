<!-- Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: use the app-owned Find My SEO fixture. -->
<!-- Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: consume the app-local simulation. -->
<template>
  <UPage>
    <UPageHeader
      title="Case studies"
      description="Structured proof from the first profile set so buyers can compare outcomes, not just positioning."
    />

    <UPageBody class="grid gap-4 lg:grid-cols-3">
      <UCard v-for="study in demoSeoCaseStudyList" :key="study.id">
        <div class="space-y-3">
          <p class="text-lg font-semibold">{{ study.title }}</p>
          <p class="text-sm text-dimmed">{{ ownerName(study.ownerEntityId) }} · {{ study.clientType }} · {{ study.timeframeLabel }}</p>
          <p class="text-sm leading-6 text-toned">{{ study.problem }}</p>
          <p class="text-sm leading-6">{{ study.resultsSummary }}</p>
          <ul class="space-y-2 text-sm">
            <li v-for="metric in study.metrics" :key="metric.label">{{ metric.label }}: {{ metric.value }}</li>
          </ul>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { demoSeoCaseStudyList, demoSeoProviderList } from '../../simulations/findMySeo'

const ownerName = (providerId: string) =>
  demoSeoProviderList.find((provider) => provider.id === providerId)?.displayName ?? 'SEO provider'
</script>
