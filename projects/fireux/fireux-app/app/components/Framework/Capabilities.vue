<template>
  <section aria-labelledby="capability-library-heading" class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h2 id="capability-library-heading" class="text-2xl font-semibold">
        Business capabilities
      </h2>
      <UFormField label="Filter capabilities">
        <UInput
          v-model="query"
          placeholder="Team, calendar, money…"
          icon="i-lucide-search"
        />
      </UFormField>
    </div>
    <p class="text-muted">
      Source reviewed, not release certified. Each capability keeps its data,
      actions and authority with its owner.
    </p>
    <p role="status" class="text-sm text-muted">
      {{ filtered.length }} capabilities
    </p>
    <UPageGrid v-if="filtered.length">
      <UPageCard
        v-for="capability in filtered"
        :key="capability.title"
        :title="capability.title"
        :description="capability.description"
        :icon="capability.icon"
      >
        <UBadge color="neutral" variant="subtle" class="self-start">{{
          capability.state
        }}</UBadge>
        <p class="text-sm text-muted">{{ capability.boundary }}</p>
        <template #footer>
          <UButton
            :to="sourceUrl(capability.source)"
            target="_blank"
            label="Inspect source"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </template>
      </UPageCard>
    </UPageGrid>
    <UAlert
      v-else
      title="No matching capability"
      description="Try a different business responsibility."
      color="neutral"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Curated public literature, not a runtime registration or entitlement catalogue.
const capabilities = [
  {
    title: 'Team',
    icon: 'i-lucide-users',
    description: 'Manage people and team assignments in a selected Workspace.',
    state: 'Connected reference',
    boundary:
      'Blank has scoped readers and commands. Role labels are separate from permission enforcement; invitation delivery is not demonstrated.',
    source: 'projects/fireux/fireux-blank/app/composables/useBlankTeam.ts',
  },
  {
    title: 'Identity',
    icon: 'i-lucide-id-card',
    description: 'Read the selected record through shared identity state.',
    state: 'Read-only reference',
    boundary:
      'Blank exposes its name and read outcomes. Its identity controller explicitly disables writing.',
    source: 'projects/fireux/fireux-blank/app/composables/useBlankIdentity.ts',
  },
  {
    title: 'Products',
    icon: 'i-lucide-package',
    description:
      'Compose product information, prices and purchase presentation.',
    state: 'Existing domain source',
    boundary:
      'A product owner exists. This does not establish inventory, fulfilment or a complete neutral sales journey.',
    source:
      'packages/extensions/fireux-products/src/runtime/product/components/Detail/Summary.vue',
  },
  {
    title: 'Calendar',
    icon: 'i-lucide-calendar',
    description: 'Navigate dates in a shared Workspace surface.',
    state: 'Presentation only',
    boundary:
      'Blank has no connected event source. Scheduling, availability and resource allocation remain domain work.',
    source:
      'projects/fireux/fireux-blank/app/components/Workspace/Blank/Calendar/Index.vue',
  },
  {
    title: 'Work',
    icon: 'i-lucide-list-checks',
    description: 'Track tasks within their owning business scope.',
    state: 'Industry reference',
    boundary:
      'The existing task implementation belongs to Portfolio. A neutral task contract has not been proved.',
    source:
      'packages/extensions/fireux-tasks/src/runtime/portfolio/models/task.model.ts',
  },
  {
    title: 'Money',
    icon: 'i-lucide-wallet',
    description: 'Represent money and financial facts consistently.',
    state: 'Shared primitives',
    boundary:
      'Finance provides types, calculations and fact helpers. It is not a complete invoicing or accounting product.',
    source:
      'packages/extensions/fireux-finance/src/runtime/models/financial-fact.model.ts',
  },
]
const query = ref('')
const filtered = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  return capabilities.filter((item) =>
    `${item.title} ${item.description} ${item.state} ${item.boundary}`
      .toLocaleLowerCase()
      .includes(term)
  )
})
const sourceUrl = (path: string) =>
  `https://github.com/fireuxlabs/fireux-mono/blob/main/${path}`
</script>
