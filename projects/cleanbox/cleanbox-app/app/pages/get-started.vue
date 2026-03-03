<template>
  <div class="space-y-16 pb-20">
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Get live fast
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            Run cleaning operations with proof and control
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Cleanbox unifies scheduling, quality checks, and billing so crews can
            execute reliably and clients can trust every service cycle.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/dashboard" color="primary" size="lg">
              Open dashboard
            </UButton>
            <UButton to="/get-started" color="neutral" variant="ghost" size="lg">
              Review rollout
            </UButton>
          </div>
        </div>
        <div class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em]">Rollout snapshot</p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>Service model and crew roles mapped clearly</span></li>
            <li class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>Scheduling and assignment logic activated</span></li>
            <li class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>QA proof flow and sign-off rules configured</span></li>
            <li class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>Billing-ready outputs verified for operations</span></li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Three steps</p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">A practical rollout in three steps</h2>
          <p class="text-gray-600 dark:text-gray-300">Structure service delivery, activate workflows, then run with operational discipline.</p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <article v-for="step in steps" :key="step.title" class="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{{ step.badge }}</p>
            <h3 class="mt-3 text-xl font-semibold text-gray-900 dark:text-white">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ step.copy }}</p>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Get Started · Cleanbox',
  description: 'Set up scheduling, QA proof, and billing workflows in Cleanbox.',
})

const steps = [
  { badge: 'Step 1', title: 'Service baseline', copy: 'Map service types, crew structure, and standards for consistent delivery.', items: ['Service model defined', 'Crew and role map', 'Accountability model'] },
  { badge: 'Step 2', title: 'Workflow activation', copy: 'Enable scheduling, QA checks, and status flow from assignment to completion.', items: ['Scheduling rules active', 'QA evidence flow enabled', 'Client update cadence set'] },
  { badge: 'Step 3', title: 'Billing handover', copy: 'Convert execution data into billing-ready records with minimal admin effort.', items: ['Billing fields validated', 'Exports and checks ready', 'Runbook finalized'] },
]
</script>
