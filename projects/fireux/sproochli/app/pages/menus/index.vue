<template>
  <main class="min-h-screen bg-default">
    <UContainer>
      <section class="max-w-2xl space-y-8" aria-labelledby="menus-title">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <Icon name="i-lucide-arrow-left" class="size-4" />
          Sproochli
        </NuxtLink>

        <div class="pagebody">
          <p class="fx-type-caption">Menus</p>
          <h1 id="menus-title" class="fx-type-page-title">Read-only menus</h1>
          <p class="fx-type-body">
            Translated menu pages for places that need a readable QR menu, not a
            full ordering system.
          </p>
        </div>

        <UCard>
          <div class="grid min-h-40 place-items-center gap-3">
            <Icon name="i-lucide-utensils" class="size-8" />
            <p>Read-only menu translations will appear here.</p>
          </div>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Menus · Sproochli',
  description: 'Read-only translated menu pages in Sproochli.',
})
</script>
