<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            About FireUX
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            {{ appSpec.tagline }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ appSpec.description }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            We run ecosystem apps from one platform surface, so teams can ship faster,
            keep architecture aligned, and scale modules without fragmenting the system.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/apps" color="primary" size="lg">
              Open apps
            </UButton>
            <UButton to="/modules" color="neutral" variant="ghost" size="lg">
              Browse modules
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
              <span>How platform modules fit together across apps</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>The key platform records and their relationships</span>
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
              FireUX - Key Concepts (Priority Order)
            </h2>
            <ol class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">1. Ecosystem</span><br>
                FireUX is the platform ecosystem that hosts domain apps and shared contracts.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">2. Apps</span><br>
                Apps are product surfaces built from shared modules and runtime contracts.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">3. Modules</span><br>
                Modules package domain capability so apps can compose features without rewrites.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">4. Users</span><br>
                One user identity can move across multiple apps inside the ecosystem.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">5. Runtime Modes</span><br>
                Live, test, and read-only modes keep operations predictable across environments.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">6. Console Pattern</span><br>
                Console entry follows one consistent runtime-driven pattern across apps.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">7. Registry</span><br>
                App and module registry records keep ownership and wiring transparent.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">8. Public Surfaces</span><br>
                Public routes describe what is available today without exposing private operations.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">9. Service Surfaces</span><br>
                Service apps like Stitch run on the same platform contracts and identity model.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">10. Extensibility</span><br>
                New ecosystems can launch quickly without rebuilding platform fundamentals.
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
            Each module owns a clear platform responsibility and together they run the FireUX operating core.
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
  title: 'About FireUX',
  description:
    'How FireUX organizes apps, modules, registry records, and service surfaces from one platform core.',
})

const appSpec: AppSpec = {
  name: 'FireUX',
  tagline: 'Platform Operating System for Ecosystem Apps',
  description:
    'FireUX is the operating system for builders and operators. We run app discovery, module composition, and ecosystem operations from one structured platform.',
  modules: [
    {
      name: 'fireux-core',
      summary: 'Runtime contracts, identity surfaces, and shared cross-app behaviors.',
      entities: ['App', 'User'],
    },
    {
      name: 'Registry surfaces',
      summary: 'Ecosystem and module index records for platform discoverability and governance.',
      entities: ['Ecosystem registry doc', 'Module registry doc'],
    },
    {
      name: 'Catalog surfaces',
      summary: 'Public-facing catalog content used by platform pages.',
      entities: ['Product', 'BlogPost'],
    },
    {
      name: 'Stitch app surface',
      summary: 'Provider and request records for service matching flows.',
      entities: ['StitchProvider', 'StitchRequest'],
    },
  ],
  entities: [
    {
      name: 'App',
      purpose: 'Canonical app identity and metadata for platform routing and discovery.',
      keyFields: ['id', 'app_name', 'ecosystem', 'role', 'modules'],
      linksTo: ['User', 'Ecosystem registry doc', 'Module registry doc'],
    },
    {
      name: 'User',
      purpose: 'Cross-app member identity with memberships and profile flags.',
      keyFields: ['id', 'display_name', 'handle', 'userOf', 'adminOf'],
      linksTo: ['App', 'StitchProvider', 'StitchRequest'],
    },
    {
      name: 'Ecosystem registry doc',
      purpose: 'Registry index describing ecosystems and app memberships.',
      keyFields: ['id', 'name', 'team', 'apps[]'],
      linksTo: ['App', 'Module registry doc'],
    },
    {
      name: 'Module registry doc',
      purpose: 'Registry index describing module ownership and availability.',
      keyFields: ['id', 'name', 'team', 'status'],
      linksTo: ['App', 'Ecosystem registry doc'],
    },
    {
      name: 'StitchProvider',
      purpose: 'Service provider profile record for capabilities and availability.',
      keyFields: ['id', 'display_name', 'type', 'availability', 'tags'],
      linksTo: ['User', 'StitchRequest'],
    },
    {
      name: 'StitchRequest',
      purpose: 'Service request record posted for matching and delivery planning.',
      keyFields: ['id', 'title', 'status', 'budget_type', 'tags'],
      linksTo: ['User', 'StitchProvider'],
    },
  ],
  samples: [
    {
      entity: 'App',
      example: {
        id: 'granite-app',
        app_name: 'Granite',
        ecosystem: 'granite',
        role: 'global',
        modules: ['fireux-properties', 'fireux-compliance'],
      },
    },
    {
      entity: 'Ecosystem registry doc',
      example: {
        id: 'granite',
        name: 'Granite',
        team: 'fireux',
        apps: ['granite-app'],
      },
    },
    {
      entity: 'StitchProvider',
      example: {
        id: 'sp_demo_blueoak',
        display_name: 'Blue Oak Studio (Demo)',
        type: 'agency',
        availability: 'available',
        tags: ['nuxt', 'firebase', 'design-system'],
      },
    },
    {
      entity: 'StitchRequest',
      example: {
        id: 'sr_demo_console_alignment',
        title: 'Align multi-app console navigation',
        status: 'open',
        budget_type: 'retainer',
        tags: ['platform', 'ux', 'architecture'],
      },
    },
  ],
  routes: [
    { label: 'Home', path: '/', kind: 'public' },
    { label: 'Get Started', path: '/get-started', kind: 'public' },
    { label: 'Apps', path: '/apps', kind: 'public' },
    { label: 'Modules', path: '/modules', kind: 'public' },
    { label: 'Ecosystems', path: '/ecosystems', kind: 'public' },
    { label: 'Projects', path: '/projects', kind: 'public' },
    { label: 'Console Entry', path: '/console', kind: 'console' },
    { label: 'App Console', path: '/console/app', kind: 'console' },
  ],
}

const relationshipMap = `
Ecosystem registry doc
  -> App
Module registry doc
  -> App

User
  -> App (membership/admin)
  -> StitchRequest

StitchRequest
  <-> StitchProvider
`

const jsonOf = (value: Record<string, any>) => JSON.stringify(value, null, 2)
</script>
