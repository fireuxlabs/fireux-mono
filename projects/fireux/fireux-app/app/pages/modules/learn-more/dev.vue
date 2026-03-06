<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Modules: Learn More (Dev)"
      description="Technical reference for module records, runtime usage, and registry endpoints."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Registry collection: <code>modules</code>.</li>
          <li>Module index route reads product records filtered by <code>product_type = module</code>.</li>
          <li>Module detail route is exposed as <code>/modules/[id]</code>.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary endpoints</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="rounded border border-default p-3">
            <p class="font-mono">GET /api/registry</p>
            <p class="text-dimmed">Read module registry rows for compatibility checks.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">POST /api/registry</p>
            <p class="text-dimmed">Create/update module rows with type <code>module</code>.</p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/modules" color="primary" icon="i-lucide-puzzle">Open modules</UButton>
        <UButton to="/modules/learn-more" color="neutral" variant="soft" icon="i-lucide-book-open">Public guide</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  tag: 'modules',
  layout: 'default',
  name: 'ModulesLearnMoreDevPage',
})

useSeoMeta({
  title: 'Modules: Learn More (Dev) · FireUX',
  description: 'Technical reference for FireUX module records, routes, and integration endpoints.',
})
</script>
