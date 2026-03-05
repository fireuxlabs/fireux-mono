<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            About Granite
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            {{ appSpec.tagline }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ appSpec.description }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            We run portfolio oversight in one branch operating flow, so teams can manage
            properties, compliance, incidents, documents, and financial signals with clear accountability.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/console/portfolio" color="primary" size="lg">
              Open portfolio hub
            </UButton>
            <UButton to="/get-started" color="neutral" variant="ghost" size="lg">
              Review rollout
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
              <span>How Granite modules fit together in operations</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>The core entities and their relationships</span>
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
              Granite - Key Concepts (Priority Order)
            </h2>
            <ol class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">1. Ecosystem</span><br>
                An ecosystem of apps for property portfolio management.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">2. Portfolios</span><br>
                A portfolio is a structured collection of properties managed as a single investment.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">3. Clients</span><br>
                Clients are the individuals or companies who own the portfolios.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">4. Properties</span><br>
                Properties are the individual assets that make up a portfolio.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">5. Portfolio Control</span><br>
                Granite provides a structured system to oversee and manage property portfolios.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">6. Financial Signals</span><br>
                Granite tracks performance indicators such as yield, costs, and portfolio health.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">7. Compliance</span><br>
                Regulatory requirements, certifications, and safety obligations are tracked across properties.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">8. Documents</span><br>
                Leases, certificates, contracts, and records are organised per property and portfolio.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">9. Incidents</span><br>
                Issues such as repairs, complaints, or safety events are recorded and monitored.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">10. Console</span><br>
                A portfolio console gives managers one place to oversee the entire portfolio.
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
            Each module owns a clear operational area, and together they power one portfolio workflow.
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
  title: 'About Granite',
  description:
    'We run portfolio operations from one branch console with structured control across properties, compliance, documents, and tasks.',
})

const appSpec: AppSpec = {
  name: 'Granite',
  tagline: 'Operating System for Portfolio Control',
  description:
    'We run portfolio operations from one branch console, with clear structure for properties, compliance, documents, incidents, and financial signals.',
  modules: [
    {
      name: 'fireux-properties',
      summary: 'Portfolio structure and tenancy-facing records.',
      entities: ['Portfolio', 'Property', 'Unit', 'Client'],
    },
    {
      name: 'fireux-compliance',
      summary: 'Compliance definitions and evidence tracking.',
      entities: ['ComplianceItemType', 'ComplianceRecord'],
    },
    {
      name: 'fireux-documents',
      summary: 'Document storage metadata and linking to operational entities.',
      entities: ['Document', 'DocumentLink'],
    },
    {
      name: 'fireux-tasks',
      summary: 'Task workflow for incidents, compliance, and operational follow-up.',
      entities: ['Task'],
    },
    {
      name: 'Identity records',
      summary: 'Shared location and company records used where needed.',
      entities: ['Place', 'Company'],
    },
  ],
  entities: [
    {
      name: 'Portfolio',
      purpose: 'Top-level managed investment or property grouping.',
      keyFields: ['id', 'name', 'owner_label', 'region_label', 'strategy_label'],
      linksTo: ['Property', 'Client', 'Task', 'ComplianceRecord'],
    },
    {
      name: 'Property',
      purpose: 'Managed property asset inside a portfolio.',
      keyFields: ['id', 'portfolio_id', 'title', 'address_label', 'estimated_value'],
      linksTo: ['Unit', 'Client', 'ComplianceRecord', 'DocumentLink', 'Task'],
    },
    {
      name: 'Unit',
      purpose: 'Lettable or manageable unit under a property.',
      keyFields: ['id', 'property_id', 'label', 'status', 'rent_minor'],
      linksTo: ['Client', 'ComplianceRecord', 'DocumentLink'],
    },
    {
      name: 'Client',
      purpose: 'Organization or individual client/occupier relationship record.',
      keyFields: ['id', 'display_name', 'entity_kind', 'status', 'portfolio_id'],
      linksTo: ['Portfolio', 'Property', 'Unit', 'Task'],
    },
    {
      name: 'ComplianceItemType',
      purpose: 'Definition of what evidence is required and how often.',
      keyFields: ['id', 'name', 'scope', 'recurrence_days', 'active'],
      linksTo: ['ComplianceRecord'],
    },
    {
      name: 'ComplianceRecord',
      purpose: 'Actual evidence record with issue/expiry dates and status.',
      keyFields: ['id', 'item_type_id', 'scope_type', 'scope_id', 'expiry_date'],
      linksTo: ['ComplianceItemType', 'DocumentLink', 'Task'],
    },
    {
      name: 'Document',
      purpose: 'Document metadata for files used as operational evidence.',
      keyFields: ['id', 'name', 'mime_type', 'size_bytes', 'storage_path'],
      linksTo: ['DocumentLink'],
    },
    {
      name: 'DocumentLink',
      purpose: 'Bridge that attaches a document to a target entity.',
      keyFields: ['id', 'document_id', 'target_type', 'target_id'],
      linksTo: ['Document', 'Portfolio', 'Property', 'Unit', 'ComplianceRecord', 'Task'],
    },
    {
      name: 'Task',
      purpose: 'Operational action item for incidents, compliance, and follow-up.',
      keyFields: ['id', 'title', 'status', 'priority', 'linked_entity_type'],
      linksTo: ['Portfolio', 'Property', 'Unit', 'ComplianceRecord', 'DocumentLink'],
    },
    {
      name: 'Place',
      purpose: 'Canonical place identity used by related assets or companies.',
      keyFields: ['id', 'name', 'formatted_address', 'lat', 'lng'],
      linksTo: ['Company', 'Property'],
    },
    {
      name: 'Company',
      purpose: 'Organization identity record used for ownership or counterparties.',
      keyFields: ['id', 'name', 'place_id', 'short_name'],
      linksTo: ['Place', 'Portfolio', 'Client'],
    },
  ],
  samples: [
    {
      entity: 'Portfolio',
      example: {
        id: 'portfolio_rivergate_demo',
        name: 'Rivergate Holdings Demo Portfolio',
        owner_label: 'Rivergate Holdings Ltd',
        region_label: 'Zurich + Bern',
        strategy_label: 'Income stability',
      },
    },
    {
      entity: 'Property',
      example: {
        id: 'prop_langstrasse_14',
        portfolio_id: 'portfolio_rivergate_demo',
        title: 'Langstrasse 14',
        address_label: 'Langstrasse 14, 8004 Zurich',
        estimated_value: 5400000,
      },
    },
    {
      entity: 'Client',
      example: {
        id: 'client_alpine_fund',
        display_name: 'Alpine Residential Fund',
        entity_kind: 'organization',
        status: 'active',
        portfolio_id: 'portfolio_rivergate_demo',
      },
    },
    {
      entity: 'ComplianceRecord',
      example: {
        id: 'comp_fire_alarm_q1',
        item_type_id: 'type_fire_alarm',
        scope_type: 'property',
        scope_id: 'prop_langstrasse_14',
        issue_date: '2026-01-18',
        expiry_date: '2027-01-18',
      },
    },
    {
      entity: 'Task',
      example: {
        id: 'task_leak_4021',
        title: 'Resolve boiler pressure issue',
        status: 'in_progress',
        priority: 'high',
        linked_entity_type: 'property',
        linked_entity_id: 'prop_langstrasse_14',
      },
    },
  ],
  routes: [
    { label: 'Home', path: '/', kind: 'public' },
    { label: 'Get Started', path: '/get-started', kind: 'public' },
    { label: 'Portfolios', path: '/portfolios', kind: 'public' },
    { label: 'Console Entry', path: '/console', kind: 'console' },
    { label: 'Portfolio Hub', path: '/console/portfolio', kind: 'console' },
    { label: 'Properties', path: '/console/portfolio/properties', kind: 'console' },
    { label: 'Clients', path: '/console/portfolio/clients', kind: 'console' },
    { label: 'Compliance', path: '/console/portfolio/compliance', kind: 'console' },
    { label: 'Incidents', path: '/console/portfolio/incidents', kind: 'console' },
    { label: 'Documents', path: '/console/portfolio/documents', kind: 'console' },
    { label: 'Tasks', path: '/console/portfolio/tasks', kind: 'console' },
    { label: 'Finance', path: '/console/portfolio/finance', kind: 'console' },
  ],
}

const relationshipMap = `
Portfolio
  -> Property
       -> Unit
       -> Client
  -> ComplianceRecord <- ComplianceItemType
  -> Task

Document
  -> DocumentLink
       -> Portfolio | Property | Unit | ComplianceRecord | Task

Place
  -> Company
       -> Portfolio / Client
`

const jsonOf = (value: Record<string, any>) => JSON.stringify(value, null, 2)
</script>
