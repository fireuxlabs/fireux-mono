<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500"
          >
            Onboard in days
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            Launch Misebox for your kitchen teams
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Connect your recipes, suppliers, and prep workflows with a guided
            rollout that keeps chefs, ops, and recruiters aligned from day one.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/contact" color="primary" size="lg">
              Book an onboarding call
            </UButton>
            <UButton to="/demo" color="neutral" variant="ghost" size="lg">
              Explore the product tour
            </UButton>
          </div>
        </div>
        <div
          class="rounded-2xl border border-primary-100/60 bg-primary-50/50 p-6 text-sm text-primary-900 shadow-sm dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-100"
        >
          <p class="font-semibold uppercase tracking-[0.2em] text-xs mb-4">
            Rollout snapshot
          </p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary-500" />
              <span>Chef + recruiter access provisioning</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary-500" />
              <span>Recipe, inventory, and supplier imports</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary-500" />
              <span>Shift-ready prep plans with task boards</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary-500" />
              <span>Ops dashboards tailored to each kitchen</span>
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500"
          >
            Three steps
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            Guided onboarding that matches your pace
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            We pair your culinary leads with our operator success team and keep
            every deliverable visible in the Misebox console.
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <article
            v-for="step in steps"
            :key="step.title"
            class="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500"
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
                  class="mt-0.5 text-primary-500"
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
            What to expect after you sign
          </h2>
          <dl class="mt-8 space-y-6">
            <div
              v-for="faq in faqs"
              :key="faq.title"
              class="rounded-2xl border border-gray-200/70 bg-white/80 p-5 dark:border-gray-800/70 dark:bg-gray-900/60"
            >
              <dt
                class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-500"
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
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500"
          >
            Need a faster rollout?
          </p>
          <p class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            Express onboarding is available for multi-location operators needing
            go-live in &lt; 14 days.
          </p>
          <ul class="mt-5 space-y-2">
            <li class="flex gap-2">
              <UIcon name="i-lucide-zap" class="text-primary-500" />
              <span>Daily check-ins with our implementation crew.</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-lucide-layers" class="text-primary-500" />
              <span>Parallel data migration + workflow config.</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-lucide-users" class="text-primary-500" />
              <span>Chef, recruiter, and GM training in one track.</span>
            </li>
          </ul>
          <UButton to="/contact" block class="mt-6" color="primary">
            Talk to onboarding
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
    'See how Misebox onboards culinary teams, suppliers, and recruiters with a guided rollout.',
})

const steps = [
  {
    badge: 'Week 0',
    title: 'Assessment & kickoff',
    copy: 'Share current tooling, export templates, and org structure. We map every data source and stakeholder role.',
    items: [
      'Role-based access planning',
      'Recipe + supplier audit',
      'Timeline + owners agreed',
    ],
  },
  {
    badge: 'Week 1',
    title: 'Workspace configuration',
    copy: 'Your Misebox tenant ships with pre-built workflows for recipes, inventory, and sourcing. We tailor them to each kitchen.',
    items: [
      'Brand + theme setup',
      'Core collections seeded',
      'Ops dashboards reviewed',
    ],
  },
  {
    badge: 'Week 2',
    title: 'Team enablement & go-live',
    copy: 'Chefs, recruiters, and managers get structured training plus async recordings so new hires can jump in later.',
    items: [
      'Live trainings + office hours',
      'Performance checklist sign-off',
      'Post-launch analytics review',
    ],
  },
]

const faqs = [
  {
    title: 'Data migration',
    copy: 'We accept spreadsheets, POS exports, or direct Firestore imports. Our team normalizes the data before it touches your tenant.',
  },
  {
    title: 'Security review',
    copy: 'SAML/SCIM, audit logs, and least-privilege roles are available for enterprise operators. Vendor paperwork is ready on request.',
  },
  {
    title: 'Timeline flexibility',
    copy: 'Need more time for change management? We can stretch rollout milestones or run phased kitchen pilots.',
  },
]
</script>
