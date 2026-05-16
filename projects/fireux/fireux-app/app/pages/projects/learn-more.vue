<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Projects: Learn More"
      description="How FireUX projects group one Firebase estate into a single operational console."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">What a project means in FireUX</h2>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>One project maps to one Firebase project.</li>
          <li>A project owns apps, ecosystems, config, and runtime concerns for that estate.</li>
          <li>The project console is the operational surface for managing those sections.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">How to use projects</h2>
        </template>

        <ol class="list-decimal space-y-2 pl-5 text-sm">
          <li>Open the project console from the projects index.</li>
          <li>Manage ecosystems and apps inside the project console, not from separate console families.</li>
          <li>Use the projects index as the public directory and the console as the operational layer.</li>
        </ol>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/projects" color="primary" icon="i-lucide-folders">
          Open projects
        </UButton>
        <UButton to="/console/project" color="neutral" variant="soft" icon="i-lucide-layout-dashboard">
          Enter Project Console
        </UButton>
        <UButton to="/projects/learn-more/dev" color="neutral" variant="soft" icon="i-lucide-code-2">
          Dev details
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'ProjectsLearnMorePage',
})

useSeoMeta({
  title: 'Projects: Learn More · FireUX',
  description: 'How FireUX projects group apps, ecosystems, and runtime concerns into one operational console.',
})
</script>
