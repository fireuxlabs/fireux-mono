<template>
  <section>
    <WorkspaceKitchenResearchStageNav
      :base-path="basePath"
      current="evidence"
    />

    <header>
      <p>Stage 1 · Evidence</p>
      <h1>
        {{ demand.question }}
      </h1>
      <p>{{ demand.method }}</p>
      <div>
        <UBadge color="neutral" variant="soft">
          Observed {{ demand.observedAt }}
        </UBadge>
        <UBadge color="neutral" variant="soft">{{ demand.geography }}</UBadge>
        <UBadge v-if="demand.language" color="neutral" variant="soft">
          {{ demand.language }}
        </UBadge>
      </div>
    </header>

    <section class="workspace-surface__grid">
      <div>
        <p>Search results</p>
        <h2>What people search for</h2>
      </div>
      <UPageGrid as="div">
        <UCard v-for="group in demand.seeds" :key="group.seed" variant="subtle">
          <template #header>
            <h3>{{ group.seed }}</h3>
          </template>
          <ul class="workspace-surface__grid">
            <li v-for="query in group.queries" :key="query">{{ query }}</li>
          </ul>
        </UCard>
      </UPageGrid>
    </section>

    <section>
      <p>Validation literature</p>
      <p>
        These sources validate the operational subject. Product claims are not
        treated as canonical records or implemented capabilities.
      </p>
      <ul class="workspace-surface__grid">
        <li v-for="source in demand.validationSources" :key="source.url">
          <ULink :to="source.url" target="_blank">
            {{ source.label }}
          </ULink>
          <p>{{ source.note }}</p>
        </li>
      </ul>
    </section>

    <UAlert
      color="neutral"
      variant="soft"
      title="Evidence only"
      :description="`This page records external language and source literature. Canonical ${capability} records, analysis and proposed Tools remain distinct.`"
    />
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
