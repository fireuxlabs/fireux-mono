<template>
  <div class="space-y-16 pb-20">
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Get live fast
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            Activate local supply and delivery operations
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Bringli helps you run producer onboarding, supplier readiness, and delivery
            execution in one flow before expanding into broader marketplace operations.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/suppliers" color="primary" size="lg">
              Open suppliers
            </UButton>
            <UButton to="/get-started" color="neutral" variant="ghost" size="lg">
              Review rollout
            </UButton>
          </div>
        </div>
        <div class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em]">Rollout snapshot</p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>Supplier profiles and readiness criteria configured</span></li>
            <li class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>Coverage and drop logic aligned for launch zone</span></li>
            <li class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>Operational checks active for reliable handoff</span></li>
            <li class="flex items-start gap-3"><UIcon name="i-lucide-check" class="mt-0.5 text-primary" /><span>Expansion template prepared for next market</span></li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Three steps</p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">A practical rollout in three steps</h2>
          <p class="text-gray-600 dark:text-gray-300">Build supplier quality first, operationalize delivery next, then scale market-by-market.</p>
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
  title: 'Get Started · Bringli',
  description: 'Set up supplier operations and delivery readiness in Bringli.',
})

const steps = [
  { badge: 'Step 1', title: 'Supplier baseline', copy: 'Define supplier quality, profile requirements, and readiness signals before go-live.', items: ['Supplier criteria mapped', 'Profile standards aligned', 'Readiness logic set'] },
  { badge: 'Step 2', title: 'Delivery activation', copy: 'Operationalize coverage and handoff rules for predictable drop execution.', items: ['Coverage boundaries set', 'Drop flow validated', 'Operational checks enabled'] },
  { badge: 'Step 3', title: 'Market expansion', copy: 'Replicate the launch model into new zones with minimal operational drift.', items: ['Launch model documented', 'Expansion checklist ready', 'Scale cadence defined'] },
]
</script>
