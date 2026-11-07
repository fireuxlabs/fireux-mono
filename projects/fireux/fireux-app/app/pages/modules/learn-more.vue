<!-- Concurrent edit — 2026-07-21 16:17 CEST — Module family design: align the guide with capability-package semantics. -->
<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Modules: Learn More"
      description="How modules extend FireUX apps with reusable capabilities."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">What modules are</h2>
        </template>

        <ul class="fx-list-stack">
          <li>
            Modules are source-controlled capability packages added to apps.
          </li>
          <li>
            A module may add entities, Workspace Operations, tools, or public
            surfaces.
          </li>
          <li>A module is not an app, product, or Solution by itself.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">How to use modules</h2>
        </template>

        <ol class="fx-list-stack">
          <li>Choose the capability the app needs.</li>
          <li>Add the owning module to the app.</li>
          <li>
            Expose only the entities, Operations, tools, and public surfaces the
            app uses.
          </li>
        </ol>
      </UCard>

      <div class="fx-card__actions">
        <UButton to="/modules" color="primary" icon="i-lucide-puzzle">
          Open modules
        </UButton>
        <UButton
          to="/modules/learn-more/dev"
          color="neutral"
          variant="soft"
          icon="i-lucide-code-2"
        >
          Dev details
        </UButton>
        <UButton
          to="/developer/registry"
          color="neutral"
          variant="soft"
          icon="i-lucide-database"
        >
          Directory boundary docs
        </UButton>
        <UButton
          to="/get-started"
          color="neutral"
          variant="ghost"
          icon="i-lucide-rocket"
        >
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
  description:
    'Understand how FireUX modules extend app capability with reusable features.',
})
</script>
