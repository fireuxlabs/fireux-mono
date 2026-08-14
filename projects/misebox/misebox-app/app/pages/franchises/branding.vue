<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-7xl space-y-10">
      <header class="grid gap-3">
        <p class="fx-type-headline m-0">Misebox</p>
        <h1 class="m-0 text-4xl font-black tracking-tight sm:text-5xl">Branding products</h1>
        <p class="m-0 max-w-3xl text-base leading-7 text-muted">
          Select a neutral kitchen product, apply an App or Kitchen identity, then order its approved treatment.
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
  description: 'Neutral Misebox products and their approved App and Kitchen brand treatments.',
})
</script>
