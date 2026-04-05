<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Projects: Learn More (Dev)"
      description="Technical reference for FireUX project records, collection paths, and console routes."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Projects collection: <code>projects</code>.</li>
          <li>Runtime project model: <code>FireuxProjectModel</code>.</li>
          <li>Console scope: <code>/console/projects/*</code>.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary surfaces</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="rounded border border-default p-3">
            <p class="font-mono">/projects</p>
            <p class="text-dimmed">Public project index sourced from <code>db.collections.projects</code>.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">/console/projects</p>
            <p class="text-dimmed">Project console home.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">/console/projects/ecosystem</p>
            <p class="text-dimmed">Project console section for ecosystems.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">/console/projects/apps</p>
            <p class="text-dimmed">Project console section for apps.</p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/projects" color="primary" icon="i-lucide-folders">Open projects</UButton>
        <UButton to="/projects/learn-more" color="neutral" variant="soft" icon="i-lucide-book-open">Public guide</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'ProjectsLearnMoreDevPage',
})

useSeoMeta({
  title: 'Projects: Learn More (Dev) · FireUX',
  description: 'Technical reference for FireUX project records, collection paths, and console routes.',
})
</script>
