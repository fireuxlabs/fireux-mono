<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Get live fast
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            Launch production-ready apps from one core
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            FireUX gives your team one low-code operating core for modules, ecosystems,
            automation, subscriptions, and app launch.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/modules" color="primary" size="lg">
              Explore modules
            </UButton>
            <UButton to="/ecosystems" color="neutral" variant="ghost" size="lg">
              Open ecosystems
            </UButton>
          </div>
        </div>
        <div
          class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary"
        >
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em]">
            Rollout snapshot
          </p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Core runtime configured with modules and shared UI</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Auth, data, and automation paths connected</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Ecosystem and app boundaries locked for scale</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Production release checklist ready for handover</span>
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Three steps
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            A practical rollout in three steps
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            Structure the core, activate modules, and launch with operational clarity.
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
            What happens after setup starts
          </h2>
          <dl class="mt-8 space-y-6">
            <div
              v-for="faq in faqs"
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
            Need a faster launch?
          </p>
          <p class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            Use the accelerated path when you need to move from structure to
            production with minimal rework.
          </p>
          <ul class="mt-5 space-y-2">
            <li class="flex gap-2">
              <UIcon name="i-lucide-zap" class="text-primary" />
              <span>Daily implementation checkpoints.</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-lucide-layers" class="text-primary" />
              <span>Parallel configuration and validation tracks.</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-lucide-users" class="text-primary" />
              <span>Operator handover with production guardrails.</span>
            </li>
          </ul>
          <UButton to="/projects" block class="mt-6" color="primary">
            Open projects
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
  title: 'Get Started · FireUX',
  description: 'Set up FireUX core, modules, and ecosystems for production rollout.',
})

const steps = [
  {
    badge: 'Step 1',
    title: 'Core baseline',
    copy: 'Define runtime boundaries, environments, and operating ownership for your app portfolio.',
    items: ['Core config and env map', 'Role and access model', 'Release checklist defined'],
  },
  {
    badge: 'Step 2',
    title: 'Module activation',
    copy: 'Enable the modules you need and validate data paths, auth rules, and console flows.',
    items: ['Modules enabled', 'Data + auth paths validated', 'Console routes verified'],
  },
  {
    badge: 'Step 3',
    title: 'Production launch',
    copy: 'Run the launch playbook and move to steady-state operations with clear ownership.',
    items: ['Preflight and QA sign-off', 'Deployment and monitoring', 'Post-launch review'],
  },
]

const faqs = [
  {
    title: 'Environment setup',
    copy: 'Configure project, credentials, and runtime variables once, then reuse across apps.',
  },
  {
    title: 'Module strategy',
    copy: 'Start with essential modules, then add capabilities without breaking core consistency.',
  },
  {
    title: 'Production readiness',
    copy: 'Use guardrails for auth, data, and release validation before every production push.',
  },
]
</script>
