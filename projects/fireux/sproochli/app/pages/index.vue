<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="grid min-h-screen place-items-center py-10">
      <section class="w-full max-w-xl space-y-8" aria-labelledby="sproochli-title">
        <img
          src="/img/app/wordmark-dark.svg"
          alt="Sproochli"
          class="h-14 w-auto"
        />

        <div class="space-y-3">
          <p class="text-sm font-semibold uppercase text-primary">
            Sproochli
          </p>
          <h1 id="sproochli-title" class="text-5xl font-semibold tracking-normal text-highlighted sm:text-6xl">
            Choose a branch
          </h1>
          <p class="max-w-md text-base leading-7 text-muted">
            Simple public pages for BNB guides, read-only menus, and everything else.
          </p>
        </div>

        <nav class="grid gap-3" aria-label="Sproochli page types">
          <UButton
            v-for="action in actions"
            :key="action.to"
            :to="action.to"
            :icon="action.icon"
            size="xl"
            color="primary"
            variant="solid"
            block
          >
            {{ action.label }}
          </UButton>
        </nav>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Sproochli',
  description: 'Simple public pages for BNB guides, information pages, and read-only menus.',
})

const actions = [
  {
    label: 'BNB',
    to: '/bnb/index',
    icon: 'i-lucide-house',
  },
  {
    label: 'Info',
    to: '/info/index',
    icon: 'i-lucide-info',
  },
  {
    label: 'Menus',
    to: '/menus/index',
    icon: 'i-lucide-utensils',
  },
]
</script>
