<template>
  <div class="space-y-6">
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useSupplierConsoleSelection } from '../../../composables/fireux/console/supplier/core/useSupplierConsoleSelection'
import { useSupplierCreate } from '../../../composables/fireux/firestore/supplier/mutations/useSupplierCreate'

const props = defineProps<{
  mode?: ConsoleCreateMode
  create?: (() => Promise<ConsoleCreateResult>) | undefined
  returnTo?: string
  cancelTo?: string
}>()

const emit = defineEmits<{
  (e: 'created', payload: ConsoleCreateResult): void
  (e: 'error', error: unknown): void
}>()

const router = useRouter()
const { createSupplier, createSupplierConsole } = useSupplierCreate()
const { setSupplierConsoleSelection } = useSupplierConsoleSelection()

const isCreating = ref(false)
const errorMessage = ref<string | null>(null)
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const resolvedMode = computed<ConsoleCreateMode>(() => props.mode ?? 'console')
const isConsoleMode = computed(() => resolvedMode.value === 'console')

const handleCreate = async () => {
  if (isCreating.value) return

  const create = props.create ?? (
    isConsoleMode.value ? createSupplierConsole : createSupplier
  )
  isCreating.value = true
  errorMessage.value = null

  try {
    const result = await create()
    if (isConsoleMode.value) {
      setSupplierConsoleSelection({ supplierId: result.id })
    }
    emit('created', result)
    const defaultReturnTo =
      resolvedMode.value === 'public'
        ? '/suppliers'
        : '/console/supplier'
    await router.push(props.returnTo || defaultReturnTo)
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
