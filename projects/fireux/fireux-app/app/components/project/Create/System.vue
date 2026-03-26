<template>
  <UCard :ui="{ body: 'space-y-4' }">
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
      <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
        Developer Note
      </p>
      <ul data-dev-note-body class="list-disc space-y-1 pl-4">
        <li v-if="isConsoleMode">
          Ensures
          <code>projects/&lt;id&gt;</code>
          and
          <code>apps/&lt;appId&gt;/projects/&lt;id&gt;</code>.
        </li>
        <li v-else>
          Creates or ensures
          <code>projects/&lt;id&gt;</code>.
        </li>
        <li v-if="isConsoleMode">
          Seeds console authority with the current user in
          <code>admin_ids</code>.
        </li>
        <li v-else>Does not create the app-hosted project console overlay.</li>
        <li>
          Success routes to
          <code>{{ successTo }}</code>.
        </li>
      </ul>
    </div>

    <ProjectCreateForm
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
  ConsoleCreateMode,
  ConsoleEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import ProjectCreateForm from './Form.vue'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
})

defineEmits<{
  (event: 'created', result: ConsoleEnsureResult): void
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
    ? 'We’ll ensure the project console for this app and create the public project only if it is missing.'
    : 'We’ll create the public project record from the endpoint metadata. Console setup happens later.'
)
const successTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return isConsoleMode.value ? '/console/projects/overview' : '/projects'
})
</script>
