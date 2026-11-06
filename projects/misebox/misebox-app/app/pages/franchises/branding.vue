<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer>
      <header class="grid gap-3">
        <p class="fx-type-headline m-0">Misebox</p>
        <h1 class="m-0 fx-type-page-title">Branding products</h1>
        <p class="m-0 max-w-3xl fx-type-body">
          Select a neutral kitchen product, apply an App or Kitchen identity,
          then order its approved treatment.
        </p>
      </header>

      <BrandingServingCarton />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing', name: 'MiseboxFranchiseBrandingPage' })
useSeoMeta({
  title: 'Branding products · Misebox',
  description:
    'Neutral Misebox products and their approved App and Kitchen brand treatments.',
})
</script>
