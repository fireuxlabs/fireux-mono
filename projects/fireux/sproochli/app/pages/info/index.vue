<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8">
      <section class="max-w-2xl space-y-8" aria-labelledby="info-title">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <Icon name="i-lucide-arrow-left" class="size-4" />
          Sproochli
        </NuxtLink>

        <div class="space-y-3">
          <p class="text-sm font-semibold uppercase text-primary">
            Info
          </p>
          <h1 id="info-title" class="text-5xl font-semibold tracking-normal text-highlighted">
            Information pages
          </h1>
          <p class="text-base leading-7 text-muted">
            Everything that is not a BNB guest guide or a read-only menu.
          </p>
        </div>

        <UCard>
          <UButton
            to="/info/bern-bike-rental/rental-instructions"
            icon="i-lucide-info"
            size="xl"
            color="primary"
            block
          >
            Bern Bike Rental
          </UButton>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  alias: ['/info/index'],
})

useSeoMeta({
  title: 'Info · Sproochli',
  description: 'Information pages in Sproochli.',
})
</script>
