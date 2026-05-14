<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8">
      <section class="max-w-2xl space-y-8" aria-labelledby="menus-title">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <Icon name="i-lucide-arrow-left" class="size-4" />
          Sproochli
        </NuxtLink>

        <div class="space-y-3">
          <p class="text-sm font-semibold uppercase text-primary">
            Menus
          </p>
          <h1 id="menus-title" class="text-5xl font-semibold tracking-normal text-highlighted">
            Read-only menus
          </h1>
          <p class="text-base leading-7 text-muted">
            Translated menu pages for places that need a readable QR menu, not a full ordering system.
          </p>
        </div>

        <UCard>
          <div class="grid min-h-40 place-items-center gap-3 text-center text-muted">
            <Icon name="i-lucide-utensils" class="size-8" />
            <p>Read-only menu translations will appear here.</p>
          </div>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  alias: ['/menus/index'],
})

useSeoMeta({
  title: 'Menus · Sproochli',
  description: 'Read-only translated menu pages in Sproochli.',
})
</script>
