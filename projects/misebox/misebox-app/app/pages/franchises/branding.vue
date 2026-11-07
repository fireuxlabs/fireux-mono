<template>
  <UPage>
    <UContainer>
      <header class="pagebody">
        <p class="fx-type-headline">Misebox</p>
        <h1 class="fx-type-page-title">Branding products</h1>
        <p class="fx-type-body">
          Select a neutral kitchen product, apply an App or Kitchen identity,
          then order its approved treatment.
        </p>
      </header>

      <BrandingServingCarton />
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing', name: 'MiseboxFranchiseBrandingPage' })
useSeoMeta({
  title: 'Branding products · Misebox',
  description:
    'Neutral Misebox products and their approved App and Kitchen brand treatments.',
})
</script>
