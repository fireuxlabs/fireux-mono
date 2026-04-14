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
          <code>portfolios/&lt;id&gt;</code>
          and
          <code>apps/&lt;appId&gt;/portfolios/&lt;id&gt;</code>.
        </li>
        <li v-else>
          Creates or ensures
          <code>portfolios/&lt;id&gt;</code>.
        </li>
        <li v-if="isConsoleMode">
          Adds the current user to the portfolio
          <code>team_ids</code>.
        </li>
        <li v-else>Does not create the app-hosted portfolio console overlay.</li>
        <li>
          Success routes to
          <code>{{ successTo }}</code>.
        </li>
      </ul>
    </div>

    <PortfolioCreateForm
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
import PortfolioCreateForm from './Form.vue'

const props = defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (event: 'created', result: ConsoleEnsureResult): void
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
    ? 'We’ll ensure the portfolio console for this app and create the public portfolio only if it is missing.'
    : 'We’ll create the public portfolio record. Console setup happens later.'
)
const successTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return isConsoleMode.value ? '/console/portfolio' : '/portfolios'
})
</script>
