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
      <p class="fireux-dev-note__label mb-1">
        Developer Note
      </p>
      <ul data-dev-note-body class="list-disc space-y-1 pl-4">
        <li>
          The project mutation creates
          <code>projects/&lt;id&gt;</code>.
        </li>
        <li>
          When an app context exists, the shared console create seam also creates
          <code>apps/&lt;appId&gt;/projects/&lt;id&gt;</code>.
        </li>
        <li>
          Route mode changes the entry and return flow, not the root/app write rule.
        </li>
        <li>
          Adds the current user to project
          <code>team_ids</code>
          data when records are created.
        </li>
        <li>
          Success routes to
          <code>{{ successTo }}</code>.
        </li>
      </ul>
    </div>

    <ProjectCreateWrite
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
  ConsoleCreateMode,
  ConsoleCreateResult,
} from '../../../composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useDevUi } from '../../../composables/fireux/app/ui/useDevUi'
import ProjectCreateWrite from './Write.vue'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
})

defineEmits<{
  (event: 'created', result: ConsoleCreateResult): void
}>()

const { notesVisible } = useDevUi()
const resolvedMode = computed<ConsoleCreateMode>(() => props.mode ?? 'console')
const isConsoleMode = computed(() => resolvedMode.value === 'console')
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const developerNoteTitle = computed(() => 'Create Project')
const headerTitle = computed(() =>
  isConsoleMode.value ? 'Project console details' : 'Public project details'
)
const headerDescription = computed(() =>
  isConsoleMode.value
    ? 'We’ll create the project console for this app and create the public project only if it is missing.'
    : 'We’ll create the public project record from endpoint metadata when project ingest is rebuilt.'
)
const successTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return isConsoleMode.value ? '/console/project' : '/projects'
})
</script>
