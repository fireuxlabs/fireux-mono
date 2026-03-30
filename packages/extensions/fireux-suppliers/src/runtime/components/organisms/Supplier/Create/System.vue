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
            Seeds console authority with the current operator in
            <code>admin_ids</code>.
          </li>
          <li v-else>Does not create the app-hosted supplier console overlay.</li>
          <li>
            Success routes to
            <code>{{ successTo }}</code>.
          </li>
        </ul>
      </div>

      <ul class="grid gap-3">
        <li class="flex items-center gap-3 text-sm text-dimmed">
          <UIcon name="i-lucide-badge-check" />
          <span>Listed in the FireUX directory</span>
        </li>
        <li class="flex items-center gap-3 text-sm text-dimmed">
          <UIcon name="i-lucide-briefcase" />
          <span>Add categories, coverage, and supplier details</span>
        </li>
        <li class="flex items-center gap-3 text-sm text-dimmed">
          <UIcon name="i-lucide-sparkles" />
          <span>Receive invites from chefs and teams</span>
        </li>
      </ul>

      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          <UButton
            color="primary"
            size="lg"
            class="min-w-60"
            :loading="isCreating"
            :disabled="isCreating"
            @click="handleCreate"
          >
            {{ isCreating ? 'Creating…' : 'Create supplier' }}
          </UButton>
          <UButton
            v-if="cancelTo"
            :to="cancelTo"
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
          >
            Cancel
          </UButton>
        </div>
        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { useRuntimeSupplierSelection } from '../../../../composables/fireux/app/supplier-console/state'
import { useSupplierCreate } from '../../../../composables/fireux/firestore/supplier/mutations/useSupplierCreate'

const props = defineProps<{
  mode?: ConsoleCreateMode
  create?: () => Promise<ConsoleEnsureResult>
  returnTo?: string
  cancelTo?: string
}>()

const emit = defineEmits<{
  (e: 'created', payload: ConsoleEnsureResult): void
  (e: 'error', error: unknown): void
}>()

const router = useRouter()
const { ensureSupplier } = useSupplierCreate()
const { setRuntimeSupplier } = useRuntimeSupplierSelection()
const { notesVisible } = useDevUi()

const isCreating = ref(false)
const errorMessage = ref<string | null>(null)
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const resolvedMode = computed<ConsoleCreateMode>(() => props.mode ?? 'console')
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
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  return resolvedMode.value === 'public' ? '/suppliers' : '/console/supplier/overview'
})

const handleCreate = async () => {
  if (isCreating.value) return

  const create = props.create ?? (() => ensureSupplier({ mode: resolvedMode.value }))
  isCreating.value = true
  errorMessage.value = null

  try {
    const result = await create()
    if (isConsoleMode.value) {
      setRuntimeSupplier({ supplierId: result.id, mode: 'live' })
    }
    emit('created', result)
    const fallbackTo =
      resolvedMode.value === 'public'
        ? `/suppliers/${encodeURIComponent(result.id)}`
        : '/console/supplier/overview'
    await router.push(props.returnTo || fallbackTo)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create a supplier record right now.'
    errorMessage.value = message
    emit('error', error)
  } finally {
    isCreating.value = false
  }
}
</script>
