<template>
  <div class="research-grid">
    <p class="research-reading research-copy research-muted">
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
        <header class="research-row research-row--spread">
          <div>
            <h2 class="research-subheading">Start with these capabilities</h2>
            <p class="research-copy research-muted">
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
        <div class="research-columns research-columns--three">
          <button
            v-for="capability in priorities"
            :key="capability.id"
            type="button"
            class="research-choice"
            @click="choose(capability.id)"
          >
            <span class="research-meta research-muted"
              >Priority {{ capability.priority?.rank }}</span
            >
            <strong>{{ capability.title }}</strong>
            <span class="research-pill">{{
              readiness(capability.assessment?.implementation.status)
            }}</span>
            <span class="research-action-link">Read capability →</span>
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
        <UFormField label="Find a capability">
          <UInput
            v-model="search"
            type="search"
            placeholder="Search names, information or actions…"
            icon="i-lucide-search"
          />
        </UFormField>
        <div class="research-filter-row">
          <UFormField label="Decision">
            <USelect v-model="decision" :items="decisionOptions" />
          </UFormField>
          <UFormField label="Capability" class="research-mobile-picker">
            <USelect
              :model-value="selected?.id ?? ''"
              :items="capabilityOptions"
              :disabled="!filtered.length"
              @update:model-value="selectCapability"
            />
          </UFormField>
        </div>
        <p class="research-meta research-muted" role="status">
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
            <span class="research-row research-row--start"
              ><span
                v-if="capability.priority"
                class="research-meta research-muted"
                >{{ capability.priority.rank }}.</span
              ><strong class="research-copy">{{
                capability.title
              }}</strong></span
            >
            <span class="research-meta research-muted"
              >{{ decisionLabel(capability.decision) }} ·
              {{
                readiness(capability.assessment?.implementation.status)
              }}</span
            >
          </button>
        </div>
      </aside>
      <div class="research-min-width">
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
          <header class="research-grid research-grid--compact">
            <p class="research-meta research-muted">
              {{ decisionLabel(capability.decision)
              }}<span v-if="capability.priority">
                · Validation priority {{ capability.priority.rank }}</span
              >
            </p>
            <h2 class="research-detail-title">{{ capability.title }}</h2>
          </header>
          <section v-if="capability.definition" class="research-reading">
            <h3 class="research-subheading">What this capability does</h3>
            <p>{{ capability.definition.purpose }}</p>
          </section>
          <details v-if="capability.definition" class="research-details">
            <summary>Information and tools</summary>
            <div class="research-detail-body research-reading">
              <p class="research-meta research-muted">
                Design scope. Tool availability is assessed separately under
                What is built.
              </p>
              <h3 class="research-label--strong">Information it manages</h3>
              <ul>
                <li v-for="item in capability.definition.manages" :key="item">
                  {{ item }}
                </li>
              </ul>
              <h3 class="research-label--strong">
                Information it uses from elsewhere
              </h3>
              <ul>
                <li v-for="item in capability.definition.uses" :key="item">
                  {{ item }}
                </li>
              </ul>
              <h3 class="research-label--strong">Tools to support</h3>
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
              <h3 class="research-label--strong">
                Where its responsibility ends
              </h3>
              <ul>
                <li
                  v-for="item in capability.definition.boundaries"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
              <h3 class="research-label--strong">Example service journey</h3>
              <p>{{ capability.definition.service_example }}</p>
              <p class="research-meta research-muted">
                This describes a possible use case, not a released service.
              </p>
            </div>
          </details>
          <section class="research-reading">
            <h3 class="research-subheading">Why it matters</h3>
            <p>{{ capability.rationale }}</p>
          </section>
          <div class="research-columns" v-if="capability.assessment">
            <section class="research-card research-card--muted">
              <h3 class="research-label research-label--strong">
                Evidence of need
              </h3>
              <p class="research-copy">
                {{ capability.assessment.market.confidence }} confidence
              </p>
              <p class="research-copy research-muted">
                {{ capability.assessment.market.rationale }}
              </p>
            </section>
            <section class="research-card research-card--muted">
              <h3 class="research-label research-label--strong">
                What is built
              </h3>
              <p class="research-copy">
                {{ readiness(capability.assessment.implementation.status) }}
              </p>
              <p class="research-copy research-muted">
                {{ capability.assessment.implementation.scope }}
              </p>
            </section>
          </div>
          <p v-else class="research-copy research-muted">
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
                class="research-stack research-stack--tight"
              >
                <h3 class="research-label--strong">
                  {{ toolById.get(id)?.title ?? id }}
                </h3>
                <p class="research-copy research-muted">
                  {{ toolById.get(id)?.outcome }}
                </p>
              </article>
              <p class="research-meta research-muted">
                These are tool hypotheses, not a list of shipped actions.
              </p>
            </div>
          </details>
          <details class="research-details">
            <summary>Evidence and implementation sources</summary>
            <div class="research-detail-body research-copy">
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
              <p
                v-if="capability.assessment"
                class="research-meta research-muted"
              >
                Implementation:
                {{ capability.assessment.implementation.status }} · assessed
                {{ capability.assessment.implementation.assessed_at }}
              </p>
              <ul v-if="capability.assessment">
                <li
                  v-for="path in capability.assessment.implementation
                    .source_paths"
                  :key="path"
                  class="research-source-path research-meta"
                >
                  <code>{{ path }}</code>
                </li>
              </ul>
              <p
                v-if="capability.research_route"
                class="research-source-path research-meta"
              >
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
        <h2 class="research-subheading">Proposed Workspace</h2>
        <p class="research-copy research-muted">
          {{ demand.capabilities.workspace.summary }}
        </p>
      </header>
      <div class="research-columns research-columns--three">
        <section
          v-for="group in demand.capabilities.workspace.groups"
          :key="group.label"
          class="research-card research-grid"
        >
          <h3 class="research-label--strong">{{ group.label }}</h3>
          <div v-for="item in group.items" :key="item.label">
            <button
              v-if="
                item.capability_id &&
                ordered.some((c) => c.id === item.capability_id)
              "
              type="button"
              class="research-inline-link"
              @click="choose(item.capability_id)"
            >
              {{ item.label }} →
            </button>
            <p v-else class="research-label">{{ item.label }}</p>
            <p
              v-if="item.brief"
              class="research-meta research-muted research-meta--spaced"
            >
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
const decisionOptions = computed(() => [
  { label: 'All decisions', value: 'all' },
  ...decisions.value.map((value) => ({
    label: decisionLabel(value),
    value,
  })),
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
const capabilityOptions = computed(() =>
  filtered.value.map((capability) => ({
    label: capability.title,
    value: capability.id,
  }))
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
function choose(id: string) {
  search.value = ''
  decision.value = 'all'
  selectedId.value = id
  view.value = 'capabilities'
}
function selectCapability(id: string) {
  selectedId.value = id
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
