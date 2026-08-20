<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mx-auto grid max-w-5xl gap-8">
      <header class="grid gap-3">
        <NuxtLink
          to="/tools"
          class="w-fit text-sm font-semibold text-primary hover:underline"
          >Tools</NuxtLink
        >
        <h1 class="m-0 text-3xl font-semibold text-highlighted">
          AI primitives
        </h1>
        <p class="m-0 max-w-3xl text-muted">
          FireUX AI turns supplied content into schema-checked information.
          Owning packages provide the domain instructions and decide what may be
          saved.
        </p>
      </header>
      <div class="grid gap-3 sm:grid-cols-2">
        <UCard v-for="item in primitives" :key="item.name">
          <h2 class="m-0 font-semibold text-highlighted">{{ item.name }}</h2>
          <p class="mt-1 text-sm text-muted">{{ item.description }}</p>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const primitives = [
  {
    name: 'Extract structured information',
    description:
      'Read supplied text, images or documents into a requested JSON schema.',
  },
  {
    name: 'Process document sources',
    description:
      'Process multiple source files and report complete, empty and failed results.',
  },
  {
    name: 'Merge extracted parts',
    description:
      'Combine validated results using the owning package’s merge policy.',
  },
] as const

definePageMeta({
  layout: 'landing',
  toolCatalogue: {
    owner: 'FireUX AI',
    title: 'AI primitives',
    description: 'Structured extraction primitives used by domain-owned tools.',
  },
})
</script>
