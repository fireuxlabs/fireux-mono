<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Portfolios: Learn More"
      description="How portfolio records group operational property work inside the Granite stack."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">What portfolios are</h2>
        </template>

        <ul class="list-disc fx-list-stack text-sm">
          <li>Portfolios are the operational containers used to manage property work.</li>
          <li>A portfolio groups properties, clients, documents, finance, compliance, and tasks.</li>
          <li>The portfolio console is where operators move from overview into the working surfaces.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">How to use portfolios</h2>
        </template>

        <ol class="list-decimal fx-list-stack text-sm">
          <li>Select a live or demo portfolio from the portfolio CTA.</li>
          <li>Open the portfolio console to work across properties, clients, incidents, and documents.</li>
          <li>Keep portfolio identity and operational state aligned through the same runtime record.</li>
        </ol>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/portfolios" color="primary" icon="i-lucide-building">Open portfolios</UButton>
        <UButton to="/console/portfolio" color="neutral" variant="soft" icon="i-lucide-layout-dashboard">Enter Portfolio Console</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  name: 'PortfoliosLearnMorePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Portfolios · Learn more` })

useSeoMeta({
  title: `${appName} | Portfolios · Learn more`,
  description: 'How portfolio records group operational property work inside the Granite stack.',
})
</script>
