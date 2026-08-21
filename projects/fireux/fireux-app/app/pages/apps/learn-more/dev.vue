<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Apps: Learn More (Dev)"
      description="Technical reference for FireUX app records, routes, and setup endpoints."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc fx-list-stack text-sm">
          <li>Canonical records live in the owning Project/Ecosystem database.</li>
          <li>FireUX reads an allowlisted <code>AppDirectoryEntry</code> projection.</li>
          <li><code>project_id</code> and <code>ecosystem_id</code> express relationships; role does not infer them.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary endpoints</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="fx-inset-panel">
            <p class="font-mono">GET /api/directory</p>
            <p class="text-dimmed">Read the shared FireUX App and Ecosystem directory projections.</p>
          </div>
          <div class="fx-inset-panel">
            <p class="font-mono">GET/POST /api/registry · retired</p>
            <p class="text-dimmed">Direct writes are rejected; publication belongs to the projection pipeline.</p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/apps" color="primary" icon="i-lucide-app-window">Open apps</UButton>
        <UButton to="/apps/learn-more" color="neutral" variant="soft" icon="i-lucide-book-open">Public guide</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'AppsLearnMoreDevPage',
})

useSeoMeta({
  title: 'Apps: Learn More (Dev) · FireUX',
  description: 'Technical reference for FireUX app records, routes, and integration endpoints.',
})
</script>
