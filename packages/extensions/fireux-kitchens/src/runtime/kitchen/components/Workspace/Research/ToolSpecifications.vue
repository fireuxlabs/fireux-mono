<template>
  <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
    <WorkspaceKitchenResearchStageNav :base-path="basePath" current="tools" />

    <header class="grid gap-3 border-b border-default pb-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Stage 3 · Tools
      </p>
      <h1 class="m-0 text-3xl font-semibold text-highlighted">
        Proposed {{ capability }} Tools
      </h1>
      <p class="m-0 max-w-3xl text-base text-muted">
        Language specifications derived from the capability analysis. Status
        reflects the current Tool source.
      </p>
    </header>

    <section class="grid gap-4">
      <article
        v-for="tool in tools"
        :key="tool.id"
        class="grid gap-4 rounded-xl border border-default p-5"
      >
        <header class="flex flex-wrap items-start justify-between gap-3">
          <div class="grid gap-1">
            <p class="m-0 text-xs text-dimmed">{{ tool.id }}</p>
            <h2 class="m-0 text-xl font-semibold text-highlighted">
              {{ tool.label }}
            </h2>
          </div>
          <div class="flex gap-2">
            <UBadge color="neutral" variant="outline">{{ tool.layer }}</UBadge>
            <UBadge color="neutral" variant="soft">{{ tool.status }}</UBadge>
          </div>
        </header>

        <p class="m-0 text-sm text-toned">{{ tool.purpose }}</p>

        <div
          v-if="recordsFor(tool.id).length"
          class="flex flex-wrap items-center gap-2 text-xs text-muted"
        >
          <span class="font-semibold text-highlighted">Records:</span>
          <UBadge
            v-for="record in recordsFor(tool.id)"
            :key="`${tool.id}-${record.id}-${record.mode}`"
            color="neutral"
            variant="soft"
          >
            {{ record.mode }} {{ record.label }}
          </UBadge>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <section v-for="part in toolParts" :key="part.key" class="grid gap-2">
            <h3 class="m-0 text-sm font-semibold text-highlighted">
              {{ part.label }}
            </h3>
            <ul class="fx-list-stack list-disc text-sm text-muted">
              <li v-for="item in tool[part.key] || []" :key="item">
                {{ item }}
              </li>
            </ul>
          </section>
        </div>

        <div class="grid gap-2 border-t border-default pt-4 text-sm text-muted">
          <p class="m-0">
            <strong class="text-highlighted">Authority:</strong>
            {{ tool.authority }}
          </p>
          <p class="m-0">
            <strong class="text-highlighted">Approval:</strong>
            {{ tool.approval }}
          </p>
        </div>
      </article>
    </section>

    <section
      v-if="demand.currentDrift?.length"
      class="grid gap-3 rounded-xl border border-warning/40 bg-warning/5 p-5"
    >
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-warning">
        Current scope drift
      </p>
      <ul class="fx-list-stack list-disc text-sm text-muted">
        <li v-for="item in demand.currentDrift" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section
      v-if="specialistResponsibilities.length || kitchenResponsibilities.length"
      class="grid gap-5 border-t border-default pt-8 lg:grid-cols-2"
    >
      <div
        v-if="specialistResponsibilities.length"
        class="grid content-start gap-3"
      >
        <p
          class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          {{ specialistLabel }}
        </p>
        <h2 class="m-0 text-xl font-semibold text-highlighted">
          Specialist responsibility
        </h2>
        <ul class="fx-list-stack list-disc text-sm text-muted">
          <li v-for="item in specialistResponsibilities" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
      <div
        v-if="kitchenResponsibilities.length"
        class="grid content-start gap-3"
      >
        <p
          class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          KitchenAI
        </p>
        <h2 class="m-0 text-xl font-semibold text-highlighted">
          Coordinator responsibility
        </h2>
        <ul class="fx-list-stack list-disc text-sm text-muted">
          <li v-for="item in kitchenResponsibilities" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </section>

    <section
      v-if="activation.length"
      class="grid gap-3 rounded-xl border border-default bg-elevated/30 p-5"
    >
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Activation gate
      </p>
      <ul class="fx-list-stack list-disc text-sm text-muted">
        <li v-for="item in activation" :key="item">{{ item }}</li>
      </ul>
      <p class="m-0 text-sm font-medium text-highlighted">
        Until every relevant gate is satisfied, unavailable specifications
        remain language—not Tools.
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenCapabilityResearch } from '../../../models/capability-research'

const props = defineProps<{
  capability: string
  basePath: string
  demand: KitchenCapabilityResearch
}>()

const tools = computed(
  () => props.demand.toolHypotheses || props.demand.proposedTools || []
)
const aiEntries = computed(() => Object.entries(props.demand.aiContract || {}))
const specialist = computed(() =>
  aiEntries.value.find(([key]) => key !== 'kitchenAI' && key !== 'activation')
)
const specialistLabel = computed(
  () => specialist.value?.[0] || `${props.capability}AI`
)
const specialistResponsibilities = computed(() => specialist.value?.[1] || [])
const kitchenResponsibilities = computed(
  () => props.demand.aiContract?.kitchenAI || []
)
const activation = computed(() => props.demand.aiContract?.activation || [])
const recordsFor = (toolId: string) =>
  props.demand.records.flatMap((record) => [
    ...(record.readBy.includes(toolId as `kitchen.${string}.${string}`)
      ? [{ id: record.id, label: record.label, mode: 'reads' }]
      : []),
    ...(record.writtenBy.includes(toolId as `kitchen.${string}.${string}`)
      ? [{ id: record.id, label: record.label, mode: 'writes' }]
      : []),
  ])
const toolParts = [
  { key: 'inputs' as const, label: 'Inputs' },
  { key: 'outputs' as const, label: 'Outputs' },
  { key: 'evidence' as const, label: 'Evidence' },
]
</script>
