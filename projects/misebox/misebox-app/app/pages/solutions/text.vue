<template>
  <SolutionPage :solution="solution">
    <SolutionTool :solution="solution">
      <AppToolFoldaway
        title="Text QR"
        description="This Misebox test surface is paused while Go QR tools are rebuilt as provider embeds."
        provider="Go QR"
        open
      >
        <p class="text-sm text-muted">
          Coming soon.
        </p>
      </AppToolFoldaway>
    </SolutionTool>
  </SolutionPage>
</template>

<script setup lang="ts">
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
  seo: {
    title: 'Text',
    ogTitle: 'Text',
    twitterTitle: 'Text',
    description: 'Test the Go QR text tool from Misebox.',
    ogDescription: 'Test the Go QR text tool from Misebox.',
    twitterDescription: 'Test the Go QR text tool from Misebox.',
  },
}

definePageMeta({
  layout: 'landing',
})

useSeoMeta(solution.seo)
</script>
