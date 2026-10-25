<template>
  <div class="mx-auto grid w-full max-w-6xl gap-6">
    <UButton
      to="/workspace/project/ignition-reconciliation"
      label="Ignition reconciliation"
      variant="link"
      icon="i-lucide-arrow-left"
    />
    <div class="flex flex-wrap items-end justify-between gap-4">
      <p class="max-w-2xl text-muted">
        Start with the same architectural responsibilities. Identify domain
        substitutions and real deltas, then assess what the library actually
        supports.
      </p>
      <UFormField label="Compare Misebox with"
        ><USelect v-model="selected" :items="options" class="w-52" />
      </UFormField>
    </div>
    <UAlert
      :title="
        report.candidate.kind === 'proposal'
          ? 'Dog grooming is a proposed system'
          : 'Source review, not complete product acceptance'
      "
      :description="report.boundary"
      color="neutral"
      icon="i-lucide-info"
    />
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Shared structure</h2>
      <div class="overflow-x-auto rounded-lg border border-default">
        <table class="w-full text-left text-sm">
          <thead class="bg-elevated">
            <tr>
              <th class="p-3">Area</th>
              <th class="p-3">Misebox</th>
              <th class="p-3">{{ report.candidate.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in report.shared"
              :key="row.key"
              class="border-t border-default align-top"
            >
              <th class="p-3 font-medium">{{ row.label }}</th>
              <td class="p-3">
                <p>{{ row.contract }}</p>
                <p class="mt-1 text-xs text-muted">
                  {{ label(row.baseline.level) }}
                </p>
              </td>
              <td class="p-3">
                <p>{{ row.contract }}</p>
                <p class="mt-1 text-xs text-muted">
                  {{ label(row.candidate.level) }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <FireDisclosurePanel title="Evidence and limits"
        ><ul class="mt-3 space-y-3 text-sm">
          <li v-for="row in report.shared" :key="row.key">
            <strong>{{ row.label }}</strong>
            <p class="mt-1 text-muted">Misebox: {{ row.baseline.note }}</p>
            <p class="mt-1 text-muted">
              {{ report.candidate.name }}: {{ row.candidate.note }}
            </p>
          </li>
        </ul></FireDisclosurePanel
      >
    </section>
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Domain substitutions</h2>
      <div class="overflow-x-auto rounded-lg border border-default">
        <table class="w-full text-left text-sm">
          <thead class="bg-elevated">
            <tr>
              <th class="p-3">Role</th>
              <th class="p-3">Misebox</th>
              <th class="p-3">{{ report.candidate.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in domainRows"
              :key="row.key"
              class="border-t border-default align-top"
            >
              <th class="p-3 font-medium">{{ row.label }}</th>
              <td class="p-3">{{ report.baseline.domain[row.key] }}</td>
              <td class="p-3">{{ report.candidate.domain[row.key] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Real deltas</h2>
      <UCard v-for="delta in report.deltas" :key="delta.id"
        ><div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="font-semibold">{{ delta.title }}</h3>
          <UBadge color="neutral" variant="subtle">{{
            delta.kind === 'new-behaviour'
              ? 'New behaviour'
              : delta.kind === 'composition'
                ? 'Composition'
                : 'Configuration'
          }}</UBadge>
        </div>
        <p class="mt-3 text-sm text-muted">
          {{ delta.baseline }} → {{ delta.candidate }}
        </p>
        <p class="mt-3">{{ delta.reason }}</p>
        <p class="mt-3 text-sm font-medium">
          {{ reuseLabel(delta.reuse) }}
        </p>
        <p class="mt-2 text-sm text-muted">
          Acceptance: {{ delta.acceptance }}
        </p>
        <FireDisclosurePanel
          v-if="delta.references.length"
          title="Source references"
          ><ul class="mt-2 space-y-1 text-sm text-muted">
            <li v-for="reference in delta.references" :key="reference">
              {{ reference }}
            </li>
          </ul></FireDisclosurePanel
        ></UCard
      >
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { compareIndustries } from 'fireux-ignite/runtime/utils/compare-industries'
import type {
  ComparisonObservation,
  IgnitionIndustryComparison,
  IgnitionIndustryCase,
} from 'fireux-ignite/runtime/models/industry-comparison'
import { industryComparisons } from '../../../ignition/industry-comparisons'
const selected = ref(industryComparisons[0]!.id)
const options = industryComparisons.map((item) => ({
  label: item.candidate.name,
  value: item.id,
}))
const report = computed(() =>
  compareIndustries(
    industryComparisons.find((item) => item.id === selected.value) ||
      industryComparisons[0]!
  )
)
const domainRows: {
  key: keyof IgnitionIndustryCase['domain']
  label: string
}[] = [
  { key: 'workspaceEntity', label: 'Workspace Entity' },
  { key: 'managedInformation', label: 'Managed information' },
  { key: 'operationalRecord', label: 'Operational record' },
  { key: 'serviceOutcome', label: 'Service outcome' },
]
const label = (level: ComparisonObservation['level']) =>
  ({
    'source-reviewed': 'Source reviewed',
    partial: 'Partial implementation',
    proposed: 'Proposed',
    unverified: 'Not reviewed',
  })[level]
const reuseLabel = (
  reuse: IgnitionIndustryComparison['deltas'][number]['reuse']
) =>
  ({
    'existing-source':
      'Existing source available; journey verification remains separate.',
    'partial-source':
      'Partial reuse candidate; this is not a completed shared implementation.',
    'needs-implementation': 'Implementation still needed.',
  })[reuse]
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
  roles: ['admin'],
  visibility: { ecosystems: ['fireux'] },
  nav: { hidden: true },
})
</script>
