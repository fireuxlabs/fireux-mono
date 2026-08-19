<template>
  <section class="mx-auto flex w-full max-w-2xl justify-center">
    <UCard class="w-full" :ui="{ body: 'space-y-6' }">
      <template #header>
        <div class="space-y-3">
          <div class="space-y-1">
            <p class="fx-type-label">
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
        <p class="fireux-dev-note__label mb-1">
          Developer Note
        </p>
        <ul data-dev-note-body class="list-disc space-y-1 pl-4">
          <li>
            The supplier mutation creates
            <code>suppliers/&lt;id&gt;</code>.
          </li>
          <li>
            Console mode uses the authenticated Supplier onboarding transaction
            to create or attach the root and its same-id App support record.
          </li>
          <li>
            The transaction also updates the current AppUser Supplier target.
          </li>
          <li>
            Adds the current operator to supplier
            <code>team_ids</code>
            data when records are created.
          </li>
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
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: describe Supplier console creation as App support.
// Concurrent edit — 2026-07-21 22:34 CEST — Supplier atomic onboarding: describe the trusted Console transaction.
import { computed } from 'vue'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
} from 'fireux-core/runtime/models/utils/entity-create.model'
import { useDevUi } from 'fireux-core/runtime/composables/dev/useDevUi'
import SupplierCreateWrite from './Write.vue'

const props = defineProps<{
  mode?: FireuxEntityCreateMode
  create?: () => Promise<FireuxEntityCreateResult>
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (e: 'created', payload: FireuxEntityCreateResult): void
  (e: 'error', error: unknown): void
}>()

const { notesVisible } = useDevUi()

const resolvedMode = computed<FireuxEntityCreateMode>(() => props.mode ?? 'console')
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
    ? 'We’ll create the supplier console for this app and create the public supplier only if it is missing.'
    : 'We’ll create only the public Supplier root. Console onboarding owns App support and access.'
)
const successTo = computed(() => {
  if (returnTo.value.startsWith('/')) return returnTo.value
  return resolvedMode.value === 'public' ? '/suppliers' : '/console/supplier'
})
</script>
