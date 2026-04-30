<template>
  <section class="mx-auto flex w-full max-w-2xl justify-center">
    <UCard class="w-full" :ui="{ body: 'space-y-6' }">
      <template #header>
        <div class="space-y-3">
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-dimmed">
              Supplier workspace
            </p>
            <h2 class="text-2xl font-semibold">
              {{ headerTitle }}
            </h2>
          </div>
          <p class="text-sm text-dimmed">
            {{ headerDescription }}
          </p>
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
            <code>suppliers/&lt;id&gt;</code>
            and
            <code>apps/&lt;appId&gt;/suppliers/&lt;id&gt;</code>.
          </li>
          <li v-else>
            Creates or ensures
            <code>suppliers/&lt;id&gt;</code>.
          </li>
          <li v-if="isConsoleMode">
            Adds the current operator to the supplier
            <code>team_ids</code>.
          </li>
          <li v-else>Does not create the app-hosted supplier console overlay.</li>
          <li>
            Success routes to
            <code>{{ successTo }}</code>.
          </li>
        </ul>
      </div>

      <SupplierCreateWrite
        :mode="resolvedMode"
        :create="create"
        :return-to="returnTo"
        :cancel-to="cancelTo"
        @created="$emit('created', $event)"
        @error="$emit('error', $event)"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import SupplierCreateWrite from './Write.vue'

const props = defineProps<{
  mode?: ConsoleCreateMode
  create?: () => Promise<ConsoleEnsureResult>
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (e: 'created', payload: ConsoleEnsureResult): void
  (e: 'error', error: unknown): void
}>()

const { notesVisible } = useDevUi()

const resolvedMode = computed<ConsoleCreateMode>(() => props.mode ?? 'console')
const create = computed(() => props.create)
const returnTo = computed(() => String(props.returnTo || '').trim())
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const isConsoleMode = computed(() => resolvedMode.value === 'console')
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const developerNoteTitle = computed(() => 'Create Supplier')
const headerTitle = computed(() =>
  isConsoleMode.value ? 'Create your supplier console' : 'Create your public supplier'
)
const headerDescription = computed(() =>
  isConsoleMode.value
    ? 'We’ll ensure the supplier console for this app and create the public supplier only if it is missing.'
    : 'We’ll create the public supplier record. Console setup happens later.'
)
const successTo = computed(() => {
  if (returnTo.value.startsWith('/')) return returnTo.value
  return resolvedMode.value === 'public' ? '/suppliers' : '/console/supplier'
})
</script>
