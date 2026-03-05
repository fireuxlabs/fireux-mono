<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            About Bringli
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            {{ appSpec.tagline }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ appSpec.description }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            We connect local producers and customers in one structured flow for supply readiness,
            discovery, and delivery execution.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/suppliers" color="primary" size="lg">
              Browse producers
            </UButton>
            <UButton to="/get-started" color="neutral" variant="ghost" size="lg">
              Open rollout
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
              <span>How Bringli modules fit together for local supply operations</span>
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
              Bringli - Key Concepts (Priority Order)
            </h2>
            <ol class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">1. Ecosystem</span><br>
                An ecosystem app for local producer supply and delivery operations.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">2. Producers</span><br>
                Producers are represented as supplier records with readiness and coverage details.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">3. Buyers</span><br>
                Bringli serves households and businesses buying from local producers.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">4. Catalog Discovery</span><br>
                Supplier surfaces make local inventory and capabilities discoverable.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">5. Operational Readiness</span><br>
                Producer onboarding focuses on quality, coverage, and delivery discipline.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">6. Drop Execution</span><br>
                Delivery handoff is structured for reliable local fulfillment.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">7. Coverage</span><br>
                Place and area identity records define where supply can be delivered.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">8. Trust</span><br>
                Stable profiles and verified contact surfaces build buyer confidence.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">9. Network Growth</span><br>
                More producers and buyers strengthen the local marketplace system.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">10. Console</span><br>
                One console anchors operational control as Bringli scales market-by-market.
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
            Bringli starts simple with supplier, company, and place identity to support local delivery operations.
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
  title: 'About Bringli',
  description:
    'How Bringli organizes local producer records, delivery readiness, and public supply routes.',
})

const appSpec: AppSpec = {
  name: 'Bringli',
  tagline: 'Operating System for Local Producer Delivery',
  description:
    'Bringli is the operating system for local producer and customer supply flow. We coordinate supplier readiness, local discovery, and delivery execution from one structured system.',
  modules: [
    {
      name: 'fireux-suppliers',
      summary: 'Supplier profile records used as producer identity and readiness surfaces.',
      entities: ['Supplier'],
    },
    {
      name: 'fireux-companies',
      summary: 'Company identity records for producer organizations.',
      entities: ['Company'],
    },
    {
      name: 'fireux-places',
      summary: 'Canonical place identity used for coverage and location discovery.',
      entities: ['Place'],
    },
    {
      name: 'fireux-core users',
      summary: 'Cross-app user identity for operators and producer owners.',
      entities: ['User'],
    },
  ],
  entities: [
    {
      name: 'Supplier',
      purpose: 'Producer profile record with categories, delivery areas, and readiness details.',
      keyFields: ['id', 'supplier_headline', 'supplier_product_categories', 'supplier_delivery_areas'],
      linksTo: ['Company', 'Place', 'User'],
    },
    {
      name: 'Company',
      purpose: 'Organization identity record for producer businesses.',
      keyFields: ['id', 'name', 'short_name', 'place_id'],
      linksTo: ['Place', 'Supplier'],
    },
    {
      name: 'Place',
      purpose: 'Canonical location record for producer presence and delivery area context.',
      keyFields: ['id', 'name', 'formatted_address', 'lat', 'lng'],
      linksTo: ['Company', 'Supplier'],
    },
    {
      name: 'User',
      purpose: 'Cross-app member identity for producer owners and operators.',
      keyFields: ['id', 'display_name', 'profiles', 'userOf', 'adminOf'],
      linksTo: ['Supplier', 'Company'],
    },
  ],
  samples: [
    {
      entity: 'Supplier',
      example: {
        id: 'supplier_demo_alpine_farm',
        supplier_headline: 'Alpine Farm Produce (Demo)',
        supplier_product_categories: ['vegetables', 'dairy'],
        supplier_delivery_areas: ['Interlaken', 'Matten'],
      },
    },
    {
      entity: 'Company',
      example: {
        id: 'company_demo_alpine_farm',
        name: 'Alpine Farm Co.',
        short_name: 'Alpine Farm',
        place_id: 'place_demo_interlaken_market',
      },
    },
    {
      entity: 'Place',
      example: {
        id: 'place_demo_interlaken_market',
        name: 'Interlaken Market Zone',
        formatted_address: 'Interlaken, Switzerland',
        lat: 46.6863,
        lng: 7.8632,
      },
    },
    {
      entity: 'User',
      example: {
        id: 'user_demo_producer_01',
        display_name: 'Demo Producer Operator',
        handle: 'demo-producer-ops',
        userOf: ['bringli-app'],
      },
    },
  ],
  routes: [
    { label: 'Home', path: '/', kind: 'public' },
    { label: 'Get Started', path: '/get-started', kind: 'public' },
    { label: 'About', path: '/about', kind: 'public' },
    { label: 'Suppliers', path: '/suppliers', kind: 'public' },
    { label: 'Console Entry', path: '/console', kind: 'console' },
  ],
}

const relationshipMap = `
Place
  -> Company
       -> Supplier

User
  -> Supplier
  -> Company
`

const jsonOf = (value: Record<string, any>) => JSON.stringify(value, null, 2)
</script>
