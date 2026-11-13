<template>
  <UCard :ui="{ body: 'fx-card-body-stack' }">
    <template #header>
      <div class="fx-card-body-stack">
        <div>{{ headerTitle }}</div>
        <div>
          {{ headerDescription }}
        </div>
      </div>
    </template>

    <div
      v-if="showDevNotes"
      data-dev-note="true"
      :data-dev-note-title="developerNoteTitle"
      class="fireux-dev-note"
    >
      <p class="fireux-dev-note__label">Developer Note</p>
      <ul data-dev-note-body class="fx-list-stack">
        <li>
          Creates
          <code>portfolios/&lt;id&gt;</code>
          and adds the current user beneath its
          <code>team</code>.
        </li>
        <li v-if="isWorkspaceMode">
          Selects the new Portfolio for its Workspace.
        </li>
        <li v-else>Leaves Workspace selection for later.</li>
        <li>
          Success routes to
          <code>{{ successTo }}</code
          >.
        </li>
      </ul>
    </div>

    <PortfolioCreateWrite
      :mode="resolvedMode"
      :return-to="returnTo"
      :cancel-to="cancelTo"
      @created="$emit('created', $event)"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
} from 'fireux-core/runtime/types/entity-create'
import { useDiagnosticsUi } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsUi'
import PortfolioCreateWrite from './Write.vue'

const props = defineProps<{
  mode?: FireuxEntityCreateMode
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (event: 'created', result: FireuxEntityCreateResult): void
}>()

const { notesVisible } = useDiagnosticsUi()
const resolvedMode = computed<FireuxEntityCreateMode>(
  () => props.mode ?? 'workspace'
)
const isWorkspaceMode = computed(() => resolvedMode.value === 'workspace')
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const developerNoteTitle = computed(() => 'Create Portfolio')
const headerTitle = computed(() =>
  isWorkspaceMode.value ? 'Portfolio workspace details' : 'Portfolio details'
)
const headerDescription = computed(() =>
  isWorkspaceMode.value
    ? 'Create the Portfolio, establish its Team authority, and select it for this Workspace.'
    : 'Save the Portfolio with team access. Workspace selection happens later.'
)
const successTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return isWorkspaceMode.value ? '/workspace/portfolio' : '/portfolios'
})
</script>
