<template>
  <SolutionPage :solution="solution">
    <SolutionTool>
      <AppToolFoldaway
        title="Text QR"
        description="This Misebox test surface is paused while Go QR tools are rebuilt as provider embeds."
        provider="Go QR"
        open
      >
        <p class="text-sm text-muted">Coming soon.</p>
      </AppToolFoldaway>
    </SolutionTool>
  </SolutionPage>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const solution = {
  title: 'Text',
  description: 'Test the Go QR text tool from Misebox.',
  instructions: [],
  integrations: {
    body: '',
    items: [],
  },
  upgrades: [],
  dev: {
    endpoints: [],
  },
}

definePageMeta({
  layout: 'landing',
})

useSeo({
  title: `${solution.title} - Misebox`,
  description: solution.description,
  path: '/solutions/text',
  robots: 'noindex, nofollow',
})
</script>
