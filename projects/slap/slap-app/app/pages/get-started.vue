<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.getStarted.hero.eyebrow }}
          </p>
          <h1 class="text-4xl font-semibold text-highlighted">
            {{ appMeta.getStarted.hero.title }}
          </h1>
          <p class="text-lg text-toned">
            {{ appMeta.getStarted.hero.description }}
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton :to="appMeta.getStarted.hero.primaryAction.to" color="primary" size="lg">
              {{ appMeta.getStarted.hero.primaryAction.label }}
            </UButton>
            <UButton :to="appMeta.getStarted.hero.secondaryAction.to" color="neutral" variant="ghost" size="lg">
              {{ appMeta.getStarted.hero.secondaryAction.label }}
            </UButton>
          </div>
        </div>

        <div class="grid gap-4">
          <article
            v-for="step in appMeta.getStarted.steps"
            :key="step.title"
            class="rounded-2xl border border-default bg-default/80 p-5 shadow-sm"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {{ step.badge }}
            </p>
            <h2 class="mt-2 text-lg font-semibold text-highlighted">
              {{ step.title }}
            </h2>
            <p class="mt-2 text-sm text-toned">
              {{ step.copy }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoGetStarted.title,
  description: appMeta.seoGetStarted.description,
})
</script>
