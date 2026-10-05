<template>
  <section class="research-grid">
    <header class="research-reading space-y-2">
      <p class="text-xs text-muted">
        {{ review.workspace }} · reviewed {{ review.reviewed_at }}
      </p>
      <h2 class="text-lg font-semibold">
        Current capabilities: what to keep and change
      </h2>
      <p class="text-sm text-muted">{{ review.summary }}</p>
      <p class="text-xs text-muted">
        Connected means source wiring exists. It does not mean live operator
        acceptance has passed.
      </p>
    </header>
    <details class="research-details">
      <summary>Shared foundations</summary>
      <div class="research-detail-body">
        <ul class="text-sm text-muted">
          <li v-for="foundation in review.foundations" :key="foundation">
            {{ foundation }}
          </li>
        </ul>
      </div>
    </details>
    <label class="research-grid gap-2 max-w-lg"
      ><span class="text-sm font-medium">Find a current area</span
      ><input
        v-model="search"
        type="search"
        placeholder="Search current capabilities…"
        class="research-field"
    /></label>
    <p v-if="!filtered.length" role="status" class="text-sm text-muted">
      No matching areas. Try another search.
    </p>
    <details
      v-for="entry in filtered"
      :key="entry.id"
      class="research-details"
      name="current-capability"
    >
      <summary>
        <span
          >{{ entry.title
          }}<span class="research-summary-copy block">{{
            actionLabel(entry.action)
          }}</span></span
        ><span class="research-pill">{{ statusLabel(entry.status) }}</span>
      </summary>
      <div class="research-detail-body research-reading">
        <p class="text-sm">{{ entry.rationale }}</p>
        <details class="research-details">
          <summary>Evidence and source scope</summary>
          <div class="research-detail-body text-sm">
            <p>
              Research capabilities:
              {{ entry.source_capability_ids.join(', ') }}
            </p>
            <ul>
              <li v-for="id in entry.source_observation_ids" :key="id">
                <ULink
                  v-if="evidence.get(id)?.source_url"
                  :to="evidence.get(id)!.source_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="research-evidence-link"
                  >{{ evidence.get(id)!.query }}</ULink
                >
              </li>
            </ul>
            <p class="text-xs text-muted">Implementation: {{ entry.status }}</p>
            <ul class="text-xs text-muted">
              <li
                v-for="path in entry.source_paths"
                :key="path"
                class="break-all"
              >
                <code>{{ path }}</code>
              </li>
            </ul>
          </div>
        </details>
      </div>
    </details>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  ResearchReconciliation,
  SearchDemandObservation,
} from '../../../../config/app/search-demand'
const props = defineProps<{
  review: ResearchReconciliation
  observations: SearchDemandObservation[]
}>()
const search = ref('')
watch(
  () => props.review,
  () => {
    search.value = ''
  }
)
const filtered = computed(() =>
  props.review.entries.filter((entry) =>
    `${entry.title} ${entry.rationale}`
      .toLocaleLowerCase()
      .includes(search.value.trim().toLocaleLowerCase())
  )
)
const actionLabel = (
  value: ResearchReconciliation['entries'][number]['action']
) =>
  ({
    keep: 'Keep and build on this',
    improve: 'Improve the existing workflow',
    validate: 'Validate before building',
    defer: 'Leave for later',
  })[value] ?? value
const statusLabel = (
  value: ResearchReconciliation['entries'][number]['status']
) =>
  ({
    'not-assessed': 'Not reviewed',
    'not-connected': 'Not built',
    partial: 'Partly built',
    connected: 'Connected · needs live testing',
    verified: 'Verified for stated scope',
  })[value] ?? value
const evidence = computed(
  () => new Map(props.observations.filter((o) => o.id).map((o) => [o.id!, o]))
)
</script>
<style scoped src="./reading.css"></style>
