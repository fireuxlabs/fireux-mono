<template>
  <MoleculesCreateCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">{{ headerTitle }}</div>
        <div class="text-xs text-dimmed">
          {{ headerDescription }}
        </div>
      </div>
    </template>

    <div
      v-if="showDevNotes"
      data-dev-note="true"
      :data-dev-note-title="developerNoteTitle"
      class="fireux-dev-note rounded-lg px-4 py-3 text-xs text-dimmed"
    >
      <p class="fireux-dev-note__label mb-1">Developer Note</p>
      <ul data-dev-note-body class="list-disc space-y-1 pl-4">
        <li v-if="isWorkspaceMode">
          Creates
          <code>portfolios/&lt;id&gt;</code>
          and adds the current user beneath its
          <code>team</code>.
        </li>
        <li v-else>
          Creates
          <code>portfolios/&lt;id&gt;</code>.
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
  </MoleculesCreateCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
} from 'fireux-core/runtime/models/utils/entity-create.model'
import { useDevUi } from 'fireux-core/runtime/composables/dev/useDevUi'
import PortfolioCreateWrite from './Write.vue'

const props = defineProps<{
  mode?: FireuxEntityCreateMode
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (event: 'created', result: FireuxEntityCreateResult): void
}>()

const { notesVisible } = useDevUi()
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
    : 'Create the canonical Portfolio record. Workspace selection happens later.'
)
const successTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return isWorkspaceMode.value ? '/workspace/portfolio' : '/portfolios'
})
</script>
