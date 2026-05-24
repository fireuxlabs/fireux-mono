<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.getStarted.hero.eyebrow }}
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            {{ appMeta.getStarted.hero.title }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
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
        <div
          class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary"
        >
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em]">
            {{ appMeta.getStarted.snapshotTitle }}
          </p>
          <ul class="space-y-3">
            <li v-for="tick in appMeta.getStarted.snapshotTicks" :key="tick" class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>{{ tick }}</span>
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.getStarted.stepsHeading.eyebrow }}
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            {{ appMeta.getStarted.stepsHeading.title }}
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            {{ appMeta.getStarted.stepsHeading.description }}
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <article
            v-for="step in steps"
            :key="step.title"
            class="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {{ step.badge }}
            </p>
            <h3 class="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {{ step.copy }}
            </p>
            <ul class="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li v-for="item in step.items" :key="item" class="flex gap-2">
                <UIcon name="i-lucide-arrow-right" class="mt-0.5 text-primary" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </article>
        </div>
      </UContainer>
    </section>

    <section class="bg-gray-50/80 py-16 dark:bg-gray-900/40">
      <UContainer class="grid gap-8 md:grid-cols-[2fr,1fr]">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ appMeta.getStarted.afterSetup.title }}
          </h2>
          <dl class="mt-8 space-y-6">
            <div
              v-for="faq in appMeta.getStarted.afterSetup.faqs"
              :key="faq.title"
              class="rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-800/70 dark:bg-gray-900/60"
            >
              <dt class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                {{ faq.title }}
              </dt>
              <dd class="mt-2 text-base text-gray-700 dark:text-gray-200">
                {{ faq.copy }}
              </dd>
            </div>
          </dl>
        </div>
        <div
          class="rounded-2xl border border-gray-200/70 bg-white/90 p-6 text-sm text-gray-600 shadow-lg dark:border-gray-800/70 dark:bg-gray-900/60 dark:text-gray-300"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.getStarted.afterSetup.card.eyebrow }}
          </p>
          <p class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            {{ appMeta.getStarted.afterSetup.card.title }}
          </p>
          <ul class="mt-5 space-y-2">
            <li v-for="bullet in appMeta.getStarted.afterSetup.card.bullets" :key="bullet" class="flex gap-2">
              <UIcon name="i-lucide-zap" class="text-primary" />
              <span>{{ bullet }}</span>
            </li>
          </ul>
          <UButton :to="appMeta.getStarted.afterSetup.card.action.to" block class="mt-6" color="primary">
            {{ appMeta.getStarted.afterSetup.card.action.label }}
          </UButton>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appMeta } from '../content/meta'

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
