<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Learn More: Dev"
      description="Operator and reseller reference for FireUX learn-more surfaces and endpoints."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Static learn-more routes</h2>
        </template>

        <div class="flex flex-wrap gap-2">
          <UButton to="/learn-more" color="neutral" variant="soft">/learn-more</UButton>
          <UButton to="/ecosystems/learn-more" color="neutral" variant="soft">/ecosystems/learn-more</UButton>
          <UButton to="/apps/learn-more" color="neutral" variant="soft">/apps/learn-more</UButton>
          <UButton to="/modules/learn-more" color="neutral" variant="soft">/modules/learn-more</UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Core API endpoints</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="rounded border border-default p-3">
            <p class="font-mono">GET /api/internal/landing/directory</p>
            <p class="text-dimmed">Aggregated ecosystem + app rows used by public directory surfaces.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">GET /api/registry</p>
            <p class="text-dimmed">Reads registry collections: modules, apps, ecosystems.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">POST /api/registry</p>
            <p class="text-dimmed">Writes registry records (module, app, ecosystem) for controlled setup flows.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">GET /api/docs-manifest</p>
            <p class="text-dimmed">Returns parsed docs manifest entries for operational documentation surfaces.</p>
          </div>
        </div>
      </UCard>

      <UAlert
        color="primary"
        variant="soft"
        title="For resellers and operators"
        description="Use this route as the canonical technical entry point, then drill into each stack-specific /learn-more/dev page."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'FireuxLearnMoreDevPage',
})

useSeoMeta({
  title: 'Learn More: Dev · FireUX',
  description: 'Operator reference for FireUX learn-more routes and core API endpoints.',
})
</script>
