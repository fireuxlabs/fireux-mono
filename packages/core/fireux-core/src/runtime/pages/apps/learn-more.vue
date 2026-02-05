<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/learn-more.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Learn More: Apps"
      description="How apps work inside the FireUX runtime."
    />

    <UPageBody class="pagebody">
      <p>
        Apps are the top-level workspaces that power each FireUX tenant and
        ecosystem. An app defines its identity (name, avatar, wordmarks) and the
        core content and services it exposes.
      </p>

      <div>
        <h2 class="font-semibold">On this page you can expect:</h2>
        <ul class="mt-2 list-disc space-y-1 pl-6">
          <li>Stable links to app profiles and dashboards.</li>
          <li>Brand media (avatar/wordmark) that adapts to light/dark mode.</li>
          <li>High-level metadata like tagline and ecosystem membership.</li>
        </ul>
      </div>

      <p>
        This page is intentionally lightweight so it can exist across every
        tenant without leaking any private app fields.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

definePageMeta({
  layout: 'default',
  name: 'AppsLearnMorePage',
})

useHead({ title: 'Apps · Learn More' })
</script>
