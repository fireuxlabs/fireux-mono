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
import { demoSeoCaseStudyList, demoSeoProviderList } from '../../../../../../demo/find-my-seo.demo'

const ownerName = (providerId: string) =>
  demoSeoProviderList.find((provider) => provider.id === providerId)?.displayName ?? 'SEO provider'
</script>
