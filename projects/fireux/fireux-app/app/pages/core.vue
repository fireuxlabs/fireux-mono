<template>
  <UPage>
    <UPageHeader
      title="Core"
      description="The shared runtime used by FireUX Apps and Ecosystems."
    />

    <UPageBody class="pagebody">
      <UCard class="space-y-3">
        <p class="text-sm text-toned">
          FireUX Core owns the App shell, accounts, shared Workspace contracts,
          public directory components, and runtime conventions.
        </p>

        <div class="space-y-2 text-sm text-toned">
          <p>This page is a public pointer, not the source of Core documentation.</p>
          <p>
            Browse Modules to see the reusable capabilities Apps compose on top
            of Core.
          </p>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Core',
})

useSeoMeta({
  title: 'Core · FireUX',
  description: 'The shared runtime used by FireUX Apps and Ecosystems.',
})
</script>
