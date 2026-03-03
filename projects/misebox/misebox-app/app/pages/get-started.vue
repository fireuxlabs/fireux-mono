<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary"
          >
            Get live fast
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            Run kitchen operations from one console
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Misebox connects kitchens, roles, professionals, and supplier workflows in one
            operating model so service teams can execute with less friction, hire faster,
            subscribe to the right plan, and extend into your own app.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/kitchens" color="primary" size="lg">
              Open kitchens
            </UButton>
            <UButton to="/jobs" color="neutral" variant="ghost" size="lg">
              Post a role
            </UButton>
          </div>
        </div>
        <div
          class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary"
        >
          <p class="font-semibold uppercase tracking-[0.2em] text-xs mb-4">
            Rollout snapshot
          </p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Kitchen, manager, and hiring access mapped by role</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Recipes, suppliers, and operational data loaded cleanly</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Job publishing and professional hiring flow switched on</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Kitchen and supplier consoles ready for daily execution</span>
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary"
          >
            Three steps
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            A practical rollout in three steps
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            Start with structure, activate workflows, then run service with your
            team on one consistent operating flow.
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <article
            v-for="step in steps"
            :key="step.title"
            class="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
            >
              {{ step.badge }}
            </p>
            <h3
              class="mt-3 text-xl font-semibold text-gray-900 dark:text-white"
            >
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {{ step.copy }}
            </p>
            <ul class="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li v-for="item in step.items" :key="item" class="flex gap-2">
                <UIcon
                  name="i-lucide-arrow-right"
                  class="mt-0.5 text-primary"
                />
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
            What happens after setup starts
          </h2>
          <dl class="mt-8 space-y-6">
            <div
              v-for="faq in faqs"
              :key="faq.title"
              class="rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-800/70 dark:bg-gray-900/60"
            >
              <dt
                class="text-sm font-semibold uppercase tracking-[0.2em] text-primary"
              >
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
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary"
          >
            Need a faster launch?
          </p>
          <p class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            Use express rollout when you need one operating model across multiple
            kitchens with minimal drift.
          </p>
          <ul class="mt-5 space-y-2">
            <li class="flex gap-2">
              <UIcon name="i-lucide-zap" class="text-primary" />
              <span>Daily implementation checkpoints.</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-lucide-layers" class="text-primary" />
              <span>Parallel data mapping and workflow setup.</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-lucide-users" class="text-primary" />
              <span>Team enablement for operations and hiring.</span>
            </li>
          </ul>
          <UButton to="/professionals" block class="mt-6" color="primary">
            Browse professionals
          </UButton>
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
  title: 'Get Started · Misebox',
  description:
    'Set up kitchens, roles, professionals, and supplier workflows in one Misebox operating console.',
})

const steps = [
  {
    badge: 'Step 1',
    title: 'Baseline and structure',
    copy: 'Define your kitchen model, role structure, and data shape so every team works from the same operating baseline.',
    items: [
      'Role and permission map',
      'Data and source inventory',
      'Owners and rollout timeline',
    ],
  },
  {
    badge: 'Step 2',
    title: 'Workspace activation',
    copy: 'Activate kitchens, jobs, professionals, and supplier workflows with one consistent structure across locations.',
    items: [
      'Core entities provisioned',
      'Workflow rules configured',
      'Kitchen + supplier consoles validated',
    ],
  },
  {
    badge: 'Step 3',
    title: 'Execution and handover',
    copy: 'Run live service and hiring operations in Misebox with clear accountability and repeatable workflows.',
    items: [
      'Operator runbook sign-off',
      'Shift and hiring flow checks',
      'Subscription and scale plan review',
    ],
  },
]

const faqs = [
  {
    title: 'Data migration',
    copy: 'Import from spreadsheets, exports, or Firestore sources. Data is normalized before production use.',
  },
  {
    title: 'Role and access control',
    copy: 'Use role-based access with clear responsibility boundaries for kitchens, managers, and hiring teams.',
  },
  {
    title: 'Subscriptions and app extension',
    copy: 'Start with the right subscription tier, then move into a custom app build when your operating model is ready to extend.',
  },
  {
    title: 'Phased rollout',
    copy: 'Launch one kitchen first, validate execution, then scale location-by-location using the same operating template.',
  },
]
</script>
