<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Modules: Learn More"
      description="How modules extend FireUX apps with reusable capabilities."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">What modules are</h2>
        </template>

        <ul class="list-disc fx-list-stack text-sm">
          <li>Modules are reusable building blocks that can be composed into apps.</li>
          <li>Each module ships focused capability instead of a full product shell.</li>
          <li>The module catalog helps teams assemble app surfaces with lower rebuild cost.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">How to use modules</h2>
        </template>

        <ol class="list-decimal fx-list-stack text-sm">
          <li>Choose module capabilities from the current catalog.</li>
          <li>Attach modules to app surfaces and routes.</li>
          <li>Validate runtime wiring and deploy with guard + typecheck.</li>
        </ol>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/modules" color="primary" icon="i-lucide-puzzle">
          Open modules
        </UButton>
        <UButton to="/modules/learn-more/dev" color="neutral" variant="soft" icon="i-lucide-code-2">
          Dev details
        </UButton>
        <UButton to="/developer/registry" color="neutral" variant="soft" icon="i-lucide-database">
          Directory boundary docs
        </UButton>
        <UButton to="/get-started" color="neutral" variant="ghost" icon="i-lucide-rocket">
          Get started
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'ModulesLearnMorePage',
})

useSeoMeta({
  title: 'Modules: Learn More · FireUX',
  description: 'Understand how FireUX modules extend app capability with reusable features.',
})
</script>
