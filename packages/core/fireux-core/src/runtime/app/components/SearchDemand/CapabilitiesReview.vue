<template>
  <div class="research-grid">
    <p class="research-reading text-sm text-muted">
      <strong>Capabilities</strong> are areas of work.
      <strong>Tools</strong> are actions within them.
      <strong>Services</strong> carry out business use cases using domain
      behaviour and trusted commands.
    </p>
    <nav class="research-nav" aria-label="Capability plan views">
      <button
        v-for="item in views"
        :key="item.id"
        type="button"
        :aria-pressed="view === item.id"
        @click="view = item.id"
      >
        {{ item.label }}
      </button>
    </nav>

    <section
      v-show="view === 'summary'"
      class="research-grid"
      aria-label="Plan summary"
    >
      <AppSearchDemandDeliveryBrief
        v-if="demand.reconciliation?.first_journey"
        :brief="demand.reconciliation.first_journey"
        :workspace="demand.reconciliation.workspace"
      />
      <section class="research-grid">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">Start with these capabilities</h2>
            <p class="text-sm text-muted">
              Research priorities. Availability is shown separately.
            </p>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            @click="view = 'capabilities'"
            >Explore all {{ ordered.length }}</UButton
          >
        </header>
        <div class="grid gap-3 lg:grid-cols-3">
          <button
            v-for="capability in priorities"
            :key="capability.id"
            type="button"
            class="research-choice"
            @click="choose(capability.id)"
          >
            <span class="text-xs text-muted"
              >Priority {{ capability.priority?.rank }}</span
            >
            <strong>{{ capability.title }}</strong>
            <span class="research-pill w-fit">{{
              readiness(capability.assessment?.implementation.status)
            }}</span>
            <span class="text-sm text-primary">Read capability →</span>
          </button>
        </div>
      </section>
      <details class="research-details">
        <summary>Scope and reasoning behind this plan</summary>
        <div class="research-detail-body research-reading">
          <p>{{ demand.capabilities.summary }}</p>
          <p>{{ demand.description }}</p>
          <p><strong>Who this is for:</strong> {{ demand.operator }}</p>
          <p v-if="demand.research_scope">
            <strong>Research limits:</strong>
            {{ demand.research_scope.limitations }}
          </p>
          <p>
            <strong>Next validation step:</strong>
            {{ demand.capabilities.next_step }}
          </p>
        </div>
      </details>
    </section>

    <section
      v-show="view === 'capabilities'"
      class="research-explorer"
      aria-label="Explore capabilities"
    >
      <aside class="research-grid">
        <label class="research-grid gap-2"
          ><span class="text-sm font-medium">Find a capability</span
          ><input
            v-model="search"
            type="search"
            placeholder="Search names, information or actions…"
            class="research-field"
        /></label>
        <div class="research-filter-row">
          <label class="research-grid gap-2"
            ><span class="text-xs text-muted">Decision</span
            ><select
              v-model="decision"
              class="research-field"
              aria-label="Filter capability decisions"
            >
              <option value="all">All decisions</option>
              <option v-for="value in decisions" :key="value" :value="value">
                {{ decisionLabel(value) }}
              </option>
            </select></label
          >
          <label class="research-mobile-picker research-grid gap-2"
            ><span class="text-xs text-muted">Capability</span
            ><select
              :value="selected?.id ?? ''"
              :disabled="!filtered.length"
              class="research-field"
              aria-label="Choose a capability"
              @change="selectCapability"
            >
              <option
                v-for="capability in filtered"
                :key="capability.id"
                :value="capability.id"
              >
                {{ capability.title }}
              </option>
            </select></label
          >
        </div>
        <p class="text-xs text-muted" role="status">
          {{ filtered.length }} of {{ ordered.length }} capabilities
        </p>
        <div
          class="research-list research-desktop-list"
          aria-label="Capability list"
        >
          <button
            v-for="capability in filtered"
            :key="capability.id"
            type="button"
            class="research-choice"
            :aria-current="selected?.id === capability.id ? 'true' : undefined"
            @click="selectedId = capability.id"
          >
            <span class="flex items-start gap-2"
              ><span v-if="capability.priority" class="text-xs text-muted pt-1"
                >{{ capability.priority.rank }}.</span
              ><strong class="text-sm">{{ capability.title }}</strong></span
            >
            <span class="text-xs text-muted"
              >{{ decisionLabel(capability.decision) }} ·
              {{
                readiness(capability.assessment?.implementation.status)
              }}</span
            >
          </button>
        </div>
      </aside>
      <div class="min-w-0">
        <p v-if="!selected" class="research-card" role="status">
          No matching capabilities. Try another search or decision filter.
        </p>
        <article
          v-for="capability in ordered"
          v-show="selected?.id === capability.id"
          :key="capability.id"
          class="research-card research-grid"
          :aria-label="capability.title"
        >
          <header class="research-grid gap-2">
            <p class="text-xs text-muted">
              {{ decisionLabel(capability.decision)
              }}<span v-if="capability.priority">
                · Validation priority {{ capability.priority.rank }}</span
              >
            </p>
            <h2 class="research-detail-title">{{ capability.title }}</h2>
          </header>
          <section v-if="capability.definition" class="research-reading">
            <h3 class="font-semibold mb-2">What this capability does</h3>
            <p>{{ capability.definition.purpose }}</p>
          </section>
          <details v-if="capability.definition" class="research-details">
            <summary>Information and tools</summary>
            <div class="research-detail-body research-reading">
              <p class="text-xs text-muted">
                Design scope. Tool availability is assessed separately under
                What is built.
              </p>
              <h3 class="font-semibold">Information it manages</h3>
              <ul>
                <li v-for="item in capability.definition.manages" :key="item">
                  {{ item }}
                </li>
              </ul>
              <h3 class="font-semibold">Information it uses from elsewhere</h3>
              <ul>
                <li v-for="item in capability.definition.uses" :key="item">
                  {{ item }}
                </li>
              </ul>
              <h3 class="font-semibold">Tools to support</h3>
              <ul>
                <li v-for="item in capability.definition.tools" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>
          </details>
          <details v-if="capability.definition" class="research-details">
            <summary>Boundaries and service example</summary>
            <div class="research-detail-body research-reading">
              <h3 class="font-semibold">Where its responsibility ends</h3>
              <ul>
                <li
                  v-for="item in capability.definition.boundaries"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
              <h3 class="font-semibold">Example service journey</h3>
              <p>{{ capability.definition.service_example }}</p>
              <p class="text-xs text-muted">
                This describes a possible use case, not a released service.
              </p>
            </div>
          </details>
          <section class="research-reading">
            <h3 class="font-semibold mb-2">Why it matters</h3>
            <p>{{ capability.rationale }}</p>
          </section>
          <div class="research-columns" v-if="capability.assessment">
            <section class="rounded-lg bg-elevated p-4 space-y-2">
              <h3 class="text-sm font-semibold">Evidence of need</h3>
              <p class="text-sm">
                {{ capability.assessment.market.confidence }} confidence
              </p>
              <p class="text-sm text-muted">
                {{ capability.assessment.market.rationale }}
              </p>
            </section>
            <section class="rounded-lg bg-elevated p-4 space-y-2">
              <h3 class="text-sm font-semibold">What is built</h3>
              <p class="text-sm">
                {{ readiness(capability.assessment.implementation.status) }}
              </p>
              <p class="text-sm text-muted">
                {{ capability.assessment.implementation.scope }}
              </p>
            </section>
          </div>
          <p v-else class="text-sm text-muted">
            Not assessed by this research.
          </p>
          <details
            class="research-details"
            v-if="capability.assessment || capability.priority"
          >
            <summary>What still needs validation</summary>
            <div class="research-detail-body research-reading">
              <p v-if="capability.assessment">
                <strong>Market validation gap:</strong>
                {{ capability.assessment.market.validation_gap }}
              </p>
              <p v-if="capability.priority">
                <strong>Why this priority:</strong>
                {{ capability.priority.rationale }}
              </p>
              <p>
                Connected means the implementation is wired up. Live operator
                acceptance is a separate check.
              </p>
            </div>
          </details>
          <details
            class="research-details"
            v-if="capability.source_tool_ids.length"
          >
            <summary>
              Research tool hypotheses · {{ capability.source_tool_ids.length }}
            </summary>
            <div class="research-detail-body">
              <article
                v-for="id in capability.source_tool_ids"
                :key="id"
                class="space-y-1"
              >
                <h3 class="font-semibold">
                  {{ toolById.get(id)?.title ?? id }}
                </h3>
                <p class="text-sm text-muted">
                  {{ toolById.get(id)?.outcome }}
                </p>
              </article>
              <p class="text-xs text-muted">
                These are tool hypotheses, not a list of shipped actions.
              </p>
            </div>
          </details>
          <details class="research-details">
            <summary>Evidence and implementation sources</summary>
            <div class="research-detail-body text-sm">
              <p>
                <strong>Related jobs:</strong>
                {{
                  capability.source_cluster_ids
                    .map((id) => clusterById.get(id)?.title ?? id)
                    .join(' · ') || 'App boundary decision'
                }}
              </p>
              <ul
                v-if="
                  capability.assessment?.market.source_observation_ids.length
                "
              >
                <li
                  v-for="id in capability.assessment.market
                    .source_observation_ids"
                  :key="id"
                >
                  <ULink
                    :to="evidence.get(id)?.source_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="research-evidence-link"
                    >{{ evidence.get(id)?.query ?? id }}</ULink
                  >
                </li>
              </ul>
              <p v-if="capability.assessment" class="text-xs text-muted">
                Implementation:
                {{ capability.assessment.implementation.status }} · assessed
                {{ capability.assessment.implementation.assessed_at }}
              </p>
              <ul v-if="capability.assessment">
                <li
                  v-for="path in capability.assessment.implementation
                    .source_paths"
                  :key="path"
                  class="text-xs break-all"
                >
                  <code>{{ path }}</code>
                </li>
              </ul>
              <p v-if="capability.research_route" class="text-xs break-all">
                Deeper research: <code>{{ capability.research_route }}</code>
              </p>
            </div>
          </details>
        </article>
      </div>
    </section>

    <section v-show="view === 'current'" aria-label="Current implementation">
      <AppSearchDemandReconciliation
        v-if="demand.reconciliation"
        :review="demand.reconciliation"
        :observations="demand.observations"
      />
      <p v-else class="research-card">
        The current implementation has not been reviewed yet.
      </p>
    </section>

    <section
      v-if="demand.capabilities.workspace"
      v-show="view === 'workspace'"
      class="research-grid"
      aria-label="Workspace concept"
    >
      <header class="research-reading">
        <h2 class="text-lg font-semibold mb-2">Proposed Workspace</h2>
        <p class="text-sm text-muted">
          {{ demand.capabilities.workspace.summary }}
        </p>
      </header>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <section
          v-for="group in demand.capabilities.workspace.groups"
          :key="group.label"
          class="research-card research-grid"
        >
          <h3 class="font-semibold">{{ group.label }}</h3>
          <div v-for="item in group.items" :key="item.label">
            <button
              v-if="
                item.capability_id &&
                ordered.some((c) => c.id === item.capability_id)
              "
              type="button"
              class="text-sm text-primary text-left underline underline-offset-4"
              @click="choose(item.capability_id)"
            >
              {{ item.label }} →
            </button>
            <p v-else class="text-sm font-medium">{{ item.label }}</p>
            <p v-if="item.brief" class="text-xs text-muted mt-1">
              {{ item.brief }}
            </p>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  AppSearchDemand,
  SearchDemandCapability,
  ResearchCapabilityAssessment,
} from '../../../../config/app/search-demand'
const props = defineProps<{ demand: AppSearchDemand }>()
const view = ref('summary')
const search = ref('')
const decision = ref('all')
const selectedId = ref('')
const ordered = computed(() =>
  [...props.demand.capabilities.capabilities].sort(
    (a, b) => (a.priority?.rank ?? 999) - (b.priority?.rank ?? 999)
  )
)
const priorities = computed(() =>
  ordered.value.filter((c) => c.priority).slice(0, 3)
)
const decisions = computed(() => [
  ...new Set(ordered.value.map((c) => c.decision)),
])
const filtered = computed(() =>
  ordered.value.filter(
    (c) =>
      (decision.value === 'all' || c.decision === decision.value) &&
      `${c.title} ${c.rationale} ${c.definition ? [c.definition.purpose, ...c.definition.manages, ...c.definition.uses, ...c.definition.tools].join(' ') : ''}`
        .toLocaleLowerCase()
        .includes(search.value.trim().toLocaleLowerCase())
  )
)
const selected = computed(
  () =>
    filtered.value.find((c) => c.id === selectedId.value) ?? filtered.value[0]
)
const views = computed(() => [
  { id: 'summary', label: 'Summary' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'current', label: 'Current build' },
  ...(props.demand.capabilities.workspace
    ? [{ id: 'workspace', label: 'Workspace concept' }]
    : []),
])
const toolById = computed(
  () => new Map(props.demand.tools.tools.map((t) => [t.id, t]))
)
const clusterById = computed(
  () => new Map(props.demand.analysis.clusters.map((c) => [c.id, c]))
)
const evidence = computed(
  () =>
    new Map(
      props.demand.observations.filter((o) => o.id).map((o) => [o.id!, o])
    )
)
watch(
  () => props.demand,
  () => {
    view.value = 'summary'
    search.value = ''
    decision.value = 'all'
    selectedId.value = ''
  }
)
function selectCapability(event: Event) {
  selectedId.value = (event.target as HTMLSelectElement).value
}
function choose(id: string) {
  search.value = ''
  decision.value = 'all'
  selectedId.value = id
  view.value = 'capabilities'
}
function readiness(
  status?: ResearchCapabilityAssessment['implementation']['status']
) {
  return status
    ? {
        'not-assessed': 'Not reviewed',
        'not-connected': 'Not built',
        partial: 'Partly built',
        connected: 'Connected · needs live testing',
        verified: 'Verified for stated scope',
      }[status]
    : 'Not reviewed'
}
function decisionLabel(value: SearchDemandCapability['decision']) {
  return {
    proposed: 'Proposed for validation',
    'establish-now': 'Build next',
    'establish-later': 'Build later',
    context: 'Context',
    derived: 'Future insight',
    boundary: 'Outside scope',
  }[value]
}
</script>
<style scoped src="./reading.css"></style>
