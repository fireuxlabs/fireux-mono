<template>
  <div class="space-y-6">
    <UFormField
      v-if="isConsoleMode && !create"
      label="Organization name"
      description="This becomes the Supplier identity and public web address."
      required
    >
      <UInput
        v-model="organizationName"
        class="w-full"
        autocomplete="organization"
        minlength="2"
        maxlength="120"
        placeholder="For example, Imkerei Familie Thöni"
      />
    </UFormField>

    <ul class="grid gap-3">
      <li class="flex items-center gap-3 text-sm text-dimmed">
        <UIcon name="i-lucide-badge-check" />
        <span>Create one canonical Supplier identity</span>
      </li>
      <li class="flex items-center gap-3 text-sm text-dimmed">
        <UIcon name="i-lucide-briefcase" />
        <span>Manage identity, categories, and delivery areas</span>
      </li>
      <li class="flex items-center gap-3 text-sm text-dimmed">
        <UIcon name="i-lucide-sparkles" />
        <span>Open Supplier Items, Ingredients, Catalogue, and Team</span>
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
          {{ isCreating ? 'Creating…' : 'Create Supplier Console' }}
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
      <p v-if="errorMessage" class="text-sm text-error">{{ errorMessage }}</p>
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
const organizationName = ref('')
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const resolvedMode = computed<ConsoleCreateMode>(() => props.mode ?? 'console')
const isConsoleMode = computed(() => resolvedMode.value === 'console')

const handleCreate = async () => {
  if (isCreating.value) return
  if (isConsoleMode.value && !props.create && organizationName.value.trim().length < 2) {
    errorMessage.value = 'Enter the supplier organization name.'
    return
  }

  const create = props.create ?? (
    isConsoleMode.value ? createSupplierConsole : createSupplier
  )
  isCreating.value = true
  errorMessage.value = null

  try {
    const result = props.create
      ? await create()
      : isConsoleMode.value
        ? await createSupplierConsole({ organizationName: organizationName.value })
        : await createSupplier()
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
