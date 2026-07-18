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

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Registry collection: <code>apps</code>.</li>
          <li>Directory shape: <code>{ id, name, ecosystem, role, src, text, href }</code>.</li>
          <li>Role controls global/tenant linking behavior for app directory cards.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary endpoints</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="fx-inset-panel">
            <p class="font-mono">GET /api/registry</p>
            <p class="text-dimmed">Read registry app rows for operational audits.</p>
          </div>
          <div class="fx-inset-panel">
            <p class="font-mono">POST /api/registry</p>
            <p class="text-dimmed">Create/update app rows with type <code>app</code>.</p>
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
