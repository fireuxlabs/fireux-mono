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
        <li v-if="isConsoleMode">
          Creates
          <code>portfolios/&lt;id&gt;</code>
          and
          <code>apps/&lt;appId&gt;/portfolios/&lt;id&gt;</code>.
        </li>
        <li v-else>
          Creates
          <code>portfolios/&lt;id&gt;</code>.
        </li>
        <li v-if="isConsoleMode">
          Adds the current user to the portfolio
          <code>team_ids</code>.
        </li>
        <li v-else>Does not create the App-hosted Portfolio support record.</li>
        <li>
          Success routes to
          <code>{{ successTo }}</code>.
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
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: describe Portfolio console creation as App support.
import { computed } from 'vue'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import PortfolioCreateWrite from './Write.vue'

const props = defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (event: 'created', result: ConsoleCreateResult): void
}>()

const { notesVisible } = useDevUi()
const resolvedMode = computed<ConsoleCreateMode>(() => props.mode ?? 'console')
const isConsoleMode = computed(() => resolvedMode.value === 'console')
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const developerNoteTitle = computed(() => 'Create Portfolio')
const headerTitle = computed(() =>
  isConsoleMode.value ? 'Portfolio console details' : 'Public portfolio details'
)
const headerDescription = computed(() =>
  isConsoleMode.value
    ? 'We’ll create the portfolio console for this app and create the public portfolio only if it is missing.'
    : 'We’ll create the public portfolio record. Console setup happens later.'
)
const successTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return isConsoleMode.value ? '/console/portfolio' : '/portfolios'
})
</script>
