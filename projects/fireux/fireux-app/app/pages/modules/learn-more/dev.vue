<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Modules: Learn More (Dev)"
      description="Technical reference for module records and runtime usage."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc fx-list-stack text-sm">
          <li>Package metadata: tracked package <code>registry.json</code> files.</li>
          <li>The module index is an authored public projection of reusable packages under <code>packages/extensions/fireux-*</code>.</li>
          <li>Module detail route is exposed as <code>/modules/[id]</code>.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Authority boundary</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="fx-inset-panel">
            <p class="font-mono">GET/POST /api/registry · retired</p>
            <p class="text-dimmed">Module package metadata is not App/Ecosystem directory truth.</p>
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
  description: 'Technical reference for FireUX module records and routes.',
})
</script>
