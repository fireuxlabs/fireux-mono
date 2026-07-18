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
        <div class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em]">{{ appMeta.getStarted.snapshotTitle }}</p>
          <ul class="space-y-3">
            <li v-for="tick in appMeta.getStarted.snapshotTicks" :key="tick" class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>{{ tick }}</span></li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{{ appMeta.getStarted.stepsHeading.eyebrow }}</p>
          <h2 class="text-3xl font-semibold text-highlighted">{{ appMeta.getStarted.stepsHeading.title }}</h2>
          <p class="text-toned">{{ appMeta.getStarted.stepsHeading.description }}</p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <article v-for="step in steps" :key="step.title" class="rounded-2xl border border-default bg-default/80 p-6 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{{ step.badge }}</p>
            <h3 class="mt-3 text-xl font-semibold text-highlighted">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-toned">{{ step.copy }}</p>
            <ul class="mt-4 space-y-2 text-sm text-muted">
              <li v-for="item in step.items" :key="item" class="flex gap-2">
                <UIcon name="i-lucide-arrow-right" class="mt-0.5 text-primary" />
                <span>{{ item }}</span>
              </li>
            </ul>
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

const steps = appMeta.getStarted.steps
</script>
