<template>
  <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
    <WorkspaceKitchenResearchStageNav
      :base-path="basePath"
      current="analysis"
    />

    <header class="grid gap-3 border-b border-default pb-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Stage 2 · Analysis
      </p>
      <h1 class="m-0 text-3xl font-semibold text-highlighted">
        The operator jobs behind {{ capability }} searches
      </h1>
      <p class="m-0 max-w-3xl text-base text-muted">
        Interpret observed language, identify required evidence, and preserve
        record authority before proposing Tools.
      </p>
    </header>

    <ol class="grid gap-4">
      <li
        v-for="(cluster, index) in demand.clusters"
        :key="cluster.id"
        class="grid gap-2 rounded-xl border border-default p-5"
      >
        <div class="flex items-start gap-3">
          <UBadge color="neutral" variant="soft">{{ index + 1 }}</UBadge>
          <div>
            <h2 class="m-0 font-semibold text-highlighted">
              {{ cluster.title }}
            </h2>
            <p class="m-0 text-sm text-toned">{{ cluster.operatorJob }}</p>
          </div>
        </div>
        <p class="m-0 text-sm text-muted">{{ cluster.interpretation }}</p>
        <p
          v-if="cluster.evidenceQueries?.length"
          class="m-0 text-xs text-dimmed"
        >
          Evidence: {{ cluster.evidenceQueries.join(' · ') }}
        </p>
        <p v-else-if="cluster.authority" class="m-0 text-xs text-dimmed">
          Authority: {{ cluster.authority }}
        </p>
        <p v-else-if="cluster.owner" class="m-0 text-xs text-dimmed">
          Owner: {{ cluster.owner }}
        </p>
        <p v-else-if="cluster.owners?.length" class="m-0 text-xs text-dimmed">
          Owners: {{ cluster.owners.join(' · ') }}
        </p>
      </li>
    </ol>

    <section class="grid gap-4 border-t border-default pt-8">
      <div>
        <p
          class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          Record map
        </p>
        <h2 class="m-0 mt-1 text-2xl font-semibold text-highlighted">
          Evidence the capability owns, references, or derives
        </h2>
      </div>
      <div class="grid gap-3 lg:grid-cols-2">
        <UCard
          v-for="record in demand.records"
          :key="record.id"
          variant="subtle"
        >
          <template #header>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="m-0 text-xs text-dimmed">{{ record.id }}</p>
                <h3 class="m-0 font-semibold text-highlighted">
                  {{ record.label }}
                </h3>
              </div>
              <div class="flex gap-2">
                <UBadge color="neutral" variant="outline">
                  {{ record.kind }}
                </UBadge>
                <UBadge color="neutral" variant="soft">
                  {{ record.status }}
                </UBadge>
              </div>
            </div>
          </template>
          <div class="grid gap-3 text-sm text-muted">
            <p class="m-0">
              <strong class="text-highlighted">Owner:</strong>
              {{ record.owner }}
            </p>
            <p class="m-0">{{ record.authority }}</p>
            <ul class="fx-list-stack list-disc">
              <li v-for="fact in record.facts" :key="fact">{{ fact }}</li>
            </ul>
          </div>
        </UCard>
      </div>
    </section>

    <section class="grid gap-3 border-t border-default pt-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Required record questions
      </p>
      <h2 class="m-0 text-xl font-semibold text-highlighted">
        What must {{ capability }} make knowable?
      </h2>
      <ul class="fx-list-stack list-disc text-sm text-muted">
        <li v-for="question in demand.recordQuestions" :key="question">
          {{ question }}
        </li>
      </ul>
    </section>

    <UAlert
      color="primary"
      variant="soft"
      title="Analysis conclusion"
      :description="demand.conclusion"
    />
    <UButton
      :to="`${basePath}/tools`"
      trailing-icon="i-lucide-arrow-right"
      class="w-fit"
    >
      Review proposed Tools
    </UButton>
  </section>
</template>

<script setup lang="ts">
import type { KitchenCapabilityResearch } from '../../../models/capability-research'

defineProps<{
  capability: string
  basePath: string
  demand: KitchenCapabilityResearch
}>()
</script>
