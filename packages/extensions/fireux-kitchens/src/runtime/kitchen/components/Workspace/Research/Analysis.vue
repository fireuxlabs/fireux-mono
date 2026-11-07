<template>
  <section>
    <WorkspaceKitchenResearchStageNav
      :base-path="basePath"
      current="analysis"
    />

    <header>
      <p>Stage 2 · Analysis</p>
      <h1>The operator jobs behind {{ capability }} searches</h1>
      <p>
        Interpret observed language, identify required evidence, and preserve
        record authority before proposing Tools.
      </p>
    </header>

    <ol class="workspace-surface__grid">
      <UCard
        as="li"
        :ui="{ body: 'fx-card-body-stack' }"
        v-for="(cluster, index) in demand.clusters"
        :key="cluster.id"
      >
        <div class="fx-card__chips">
          <UBadge color="neutral" variant="soft">{{ index + 1 }}</UBadge>
          <div>
            <h2>
              {{ cluster.title }}
            </h2>
            <p>{{ cluster.operatorJob }}</p>
          </div>
        </div>
        <p>{{ cluster.interpretation }}</p>
        <p v-if="cluster.evidenceQueries?.length">
          Evidence: {{ cluster.evidenceQueries.join(' · ') }}
        </p>
        <p v-else-if="cluster.authority">Authority: {{ cluster.authority }}</p>
        <p v-else-if="cluster.owner">Owner: {{ cluster.owner }}</p>
        <p v-else-if="cluster.owners?.length">
          Owners: {{ cluster.owners.join(' · ') }}
        </p>
      </UCard>
    </ol>

    <section>
      <div>
        <p>Record map</p>
        <h2>Evidence the capability owns, references, or derives</h2>
      </div>
      <div class="workspace-surface__grid workspace-surface__grid--2">
        <UCard
          v-for="record in demand.records"
          :key="record.id"
          variant="subtle"
        >
          <template #header>
            <div class="card__header">
              <div>
                <p>{{ record.id }}</p>
                <h3>
                  {{ record.label }}
                </h3>
              </div>
              <div class="fx-card__chips">
                <UBadge color="neutral" variant="outline">
                  {{ record.kind }}
                </UBadge>
                <UBadge color="neutral" variant="soft">
                  {{ record.status }}
                </UBadge>
              </div>
            </div>
          </template>
          <div class="workspace-surface__grid">
            <p>
              <strong>Owner:</strong>
              {{ record.owner }}
            </p>
            <p>{{ record.authority }}</p>
            <ul class="fx-list-stack">
              <li v-for="fact in record.facts" :key="fact">{{ fact }}</li>
            </ul>
          </div>
        </UCard>
      </div>
    </section>

    <section>
      <p>Required record questions</p>
      <h2>What must {{ capability }} make knowable?</h2>
      <ul class="fx-list-stack">
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
    <UButton :to="`${basePath}/tools`" trailing-icon="i-lucide-arrow-right">
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
