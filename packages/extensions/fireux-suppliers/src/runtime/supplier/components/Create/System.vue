<template>
  <section>
    <UCard :ui="{ body: 'fx-card-body-stack' }">
      <template #header>
        <div class="fx-card-body-stack">
          <div class="fx-card-body-stack">
            <p class="fx-type-label">Supplier workspace</p>
            <h2 class="fx-type-card-heading">
              {{ headerTitle }}
            </h2>
          </div>
          <p>
            {{ headerDescription }}
          </p>
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
            One authenticated onboarding transaction creates or opens the
            Supplier.
          </li>
          <li>
            The transaction establishes its Team member and membership-bound
            access.
          </li>
          <li>
            Workspace mode selects the Supplier after success; root mode leaves
            selection unchanged.
          </li>
          <li>
            Success routes to <code>{{ successTo }}</code
            >.
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
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: describe Supplier workspace creation as App support.
// Concurrent edit — 2026-07-21 22:34 CEST — Supplier atomic onboarding: describe the trusted Workspace transaction.
import { computed } from 'vue'
import type {
  FireuxEntityCreateMode,
  FireuxEntityCreateResult,
} from 'fireux-core/runtime/types/entity-create'
import { useDiagnosticsUi } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsUi'
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

const { notesVisible } = useDiagnosticsUi()

const resolvedMode = computed<FireuxEntityCreateMode>(
  () => props.mode ?? 'workspace'
)
const create = computed(() => props.create)
const returnTo = computed(() => String(props.returnTo || '').trim())
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const isWorkspaceMode = computed(() => resolvedMode.value === 'workspace')
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const developerNoteTitle = computed(() => 'Create Supplier')
const headerTitle = computed(() =>
  isWorkspaceMode.value ? 'Create Supplier Workspace' : 'Create Supplier'
)
const headerDescription = computed(() =>
  isWorkspaceMode.value
    ? 'Create or open the Supplier and establish your access, then select it for this Workspace.'
    : 'Create or open the Supplier and establish your access. Workspace selection happens later.'
)
const successTo = computed(() => {
  if (returnTo.value.startsWith('/')) return returnTo.value
  return resolvedMode.value === 'root' ? '/suppliers' : '/workspace/supplier'
})
</script>
