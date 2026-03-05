<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            About Cleanbox
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            {{ appSpec.tagline }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ appSpec.description }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            We run recurring cleaning operations with one structured flow for planning,
            service proof, and billing readiness.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/get-started" color="primary" size="lg">
              Open rollout
            </UButton>
            <UButton to="/jobs" color="neutral" variant="ghost" size="lg">
              Browse jobs
            </UButton>
          </div>
        </div>

        <div
          class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary"
        >
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em]">
            What this page covers
          </p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>How Cleanbox modules fit together in operations</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>The core records and how they connect</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Small realistic sample objects for context</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Direct links to public and console surfaces</span>
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UCard>
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Cleanbox - Key Concepts (Priority Order)
            </h2>
            <ol class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">1. Ecosystem</span><br>
                An ecosystem of apps for cleaning operations.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">2. Service Locations</span><br>
                Locations are the operational units where recurring cleaning is delivered.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">3. Jobs</span><br>
                Jobs define shifts, assignments, and service expectations.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">4. Planning</span><br>
                Scheduling and assignment keep service coverage predictable.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">5. Team Operations</span><br>
                Teams coordinate execution with clear ownership and handoff.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">6. QA Proof</span><br>
                Proof records confirm that work was completed to standard.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">7. Service History</span><br>
                History makes repeatable quality and accountability visible.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">8. Billing Readiness</span><br>
                Completed service data is structured for invoicing and reporting.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">9. Reliability</span><br>
                Cleanbox focuses on predictable recurring service, not one-off chaos.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">10. Console</span><br>
                One console coordinates daily operations from plan to proof.
              </li>
            </ol>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Modules
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            How we organize the app
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            Each module owns a clear operational area, and together they power one service workflow.
          </p>
        </div>

        <UCard>
          <UAccordion type="multiple" class="space-y-2">
            <UAccordionItem
              v-for="(module, index) in appSpec.modules"
              :key="module.name"
              :value="`module-${index}`"
              :title="module.name"
            >
              <template #body>
                <div class="space-y-3 text-sm">
                  <p class="text-gray-600 dark:text-gray-300">{{ module.summary }}</p>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="entityName in module.entities"
                      :key="`${module.name}-${entityName}`"
                      color="neutral"
                      variant="soft"
                    >
                      {{ entityName }}
                    </UBadge>
                  </div>
                </div>
              </template>
            </UAccordionItem>
          </UAccordion>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Entities
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            The records we work with every day
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="entity in appSpec.entities"
            :key="entity.name"
            class="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ entity.name }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {{ entity.purpose }}
            </p>
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">
              <span class="font-semibold text-gray-900 dark:text-white">Key fields:</span>
              {{ entity.keyFields.join(', ') }}
            </p>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <span class="font-semibold text-gray-900 dark:text-white">Links to:</span>
              {{ entity.linksTo.join(', ') }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>

    <section class="bg-gray-50/80 py-16 dark:bg-gray-900/40">
      <UContainer class="space-y-8">
        <div class="space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Structure
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            Relationship map
          </h2>
        </div>

        <UCard>
          <pre class="overflow-x-auto rounded bg-default p-4 text-xs leading-6">{{ relationshipMap }}</pre>
        </UCard>

        <div class="space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Examples
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            Sample objects
          </h2>
        </div>

        <UCard>
          <UAccordion type="multiple" class="space-y-2">
            <UAccordionItem
              v-for="(sample, index) in appSpec.samples"
              :key="`${sample.entity}-${index}`"
              :value="`sample-${index}`"
              :title="sample.entity"
            >
              <template #body>
                <pre class="overflow-x-auto rounded bg-default p-4 text-xs leading-6">{{ jsonOf(sample.example) }}</pre>
              </template>
            </UAccordionItem>
          </UAccordion>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Key routes</h3>
          </template>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="route in appSpec.routes"
              :key="route.path"
              :to="route.path"
              :icon="route.kind === 'console' ? 'i-lucide-terminal' : 'i-lucide-link'"
              :color="route.kind === 'console' ? 'primary' : 'neutral'"
              variant="soft"
            >
              {{ route.label }} · {{ route.path }}
            </UButton>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
type AppSpec = {
  name: string
  tagline: string
  description: string
  modules: Array<{ name: string; summary: string; entities: string[] }>
  entities: Array<{
    name: string
    purpose: string
    keyFields: string[]
    linksTo: string[]
  }>
  samples: Array<{ entity: string; example: Record<string, any> }>
  routes: Array<{ label: string; path: string; kind: 'public' | 'console' }>
}

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'About Cleanbox',
  description:
    'How Cleanbox organizes recurring cleaning operations, service records, and execution routes.',
})

const appSpec: AppSpec = {
  name: 'Cleanbox',
  tagline: 'Operating System for Cleaning Operations',
  description:
    'Cleanbox is the operating system for cleaning companies and crews. We coordinate planning, execution proof, and billing readiness from one structured system.',
  modules: [
    {
      name: 'cleanbox runtime',
      summary: 'Service location context and operational records for recurring work.',
      entities: ['CleanboxLocation'],
    },
    {
      name: 'fireux-jobs',
      summary: 'Job and assignment flows for staffing service operations.',
      entities: ['Job'],
    },
    {
      name: 'fireux-places',
      summary: 'Canonical location identity used by operational records.',
      entities: ['Place'],
    },
    {
      name: 'fireux-core users',
      summary: 'Cross-app user identity and memberships.',
      entities: ['User'],
    },
  ],
  entities: [
    {
      name: 'CleanboxLocation',
      purpose: 'Serviced property/location record for recurring cleaning operations.',
      keyFields: ['id', 'label', 'city', 'postcode', 'core_place_id'],
      linksTo: ['Place', 'Job', 'User'],
    },
    {
      name: 'Job',
      purpose: 'Service assignment record for shifts, role scope, and status.',
      keyFields: ['id', 'title', 'status', 'type', 'place_id'],
      linksTo: ['CleanboxLocation', 'User'],
    },
    {
      name: 'Place',
      purpose: 'Canonical location identity shared across FireUX surfaces.',
      keyFields: ['id', 'name', 'formatted_address', 'lat', 'lng'],
      linksTo: ['CleanboxLocation', 'Job'],
    },
    {
      name: 'User',
      purpose: 'Authenticated member identity for operators and coordinators.',
      keyFields: ['id', 'display_name', 'profiles', 'userOf', 'adminOf'],
      linksTo: ['CleanboxLocation', 'Job'],
    },
  ],
  samples: [
    {
      entity: 'CleanboxLocation',
      example: {
        id: 'loc_demo_warehouse_west',
        app_id: 'cleanbox-app',
        label: 'Warehouse West - Demo Site',
        city: 'Zurich',
        postcode: '8048',
        core_place_id: 'place_demo_zurich_west',
      },
    },
    {
      entity: 'Job',
      example: {
        id: 'job_demo_evening_clean',
        title: 'Evening Cleaning Shift',
        status: 'open',
        type: 'fixed',
        place_id: 'place_demo_zurich_west',
      },
    },
    {
      entity: 'Place',
      example: {
        id: 'place_demo_zurich_west',
        name: 'Zurich West Service Area',
        formatted_address: 'Zurich, Switzerland',
        lat: 47.38,
        lng: 8.52,
      },
    },
    {
      entity: 'User',
      example: {
        id: 'user_demo_ops_01',
        display_name: 'Demo Operations User',
        handle: 'demo-ops-user',
        profiles: ['operator'],
        userOf: ['cleanbox-app'],
      },
    },
  ],
  routes: [
    { label: 'Home', path: '/', kind: 'public' },
    { label: 'Get Started', path: '/get-started', kind: 'public' },
    { label: 'About', path: '/about', kind: 'public' },
    { label: 'Jobs', path: '/jobs', kind: 'public' },
    { label: 'Console Entry', path: '/console', kind: 'console' },
  ],
}

const relationshipMap = `
Place
  -> CleanboxLocation
       -> Job
       -> User (assigned/coordinator)

User
  -> Job
  -> CleanboxLocation
`

const jsonOf = (value: Record<string, any>) => JSON.stringify(value, null, 2)
</script>
