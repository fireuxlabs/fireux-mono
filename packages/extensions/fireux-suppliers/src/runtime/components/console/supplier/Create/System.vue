<template>
  <section class="supplier-create-system">
    <UCard class="create-card">
      <template #header>
        <div class="header">
          <div>
            <p class="eyebrow">Supplier workspace</p>
            <h2>Create your supplier</h2>
          </div>
          <p class="lede">
            Set up a supplier workspace with your products and capabilities. You
            can edit everything right after creating it.
          </p>
        </div>
      </template>

      <div class="body">
        <ul class="benefits">
          <li>
            <UIcon name="i-lucide-badge-check" />
            <span>Listed in the FireUX directory</span>
          </li>
          <li>
            <UIcon name="i-lucide-briefcase" />
            <span>Add products, certifications, and details</span>
          </li>
          <li>
            <UIcon name="i-lucide-sparkles" />
            <span>Receive invites from chefs and teams</span>
          </li>
        </ul>

        <div class="actions">
          <div class="flex flex-wrap gap-2">
            <UButton
              color="primary"
              size="lg"
              class="create-button"
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
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSupplierCreate } from '../../../../composables/supplier/useSupplierCreate';

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

const isCreating = ref(false)
const errorMessage = ref<string | null>(null)
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const resolvedMode = computed<ConsoleCreateMode>(() => props.mode ?? 'console')

const handleCreate = async () => {
  if (isCreating.value) return

  const create =
    props.create ?? (() => ensureSupplier({ mode: resolvedMode.value }))
  isCreating.value = true
  errorMessage.value = null

  try {
    const result = await create()
    emit('created', result)
    const fallbackTo =
      resolvedMode.value === 'public'
        ? `/suppliers/${encodeURIComponent(result.id)}`
        : '/dashboard/supplier'
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

<style scoped>
.supplier-create-system {
  display: flex;
  justify-content: center;
}

.create-card {
  max-width: 720px;
  width: 100%;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-text-400, #94a3b8);
  margin: 0;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.lede {
  margin: 0;
  color: var(--ui-text-500, #64748b);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.benefits li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--ui-text-600, #475569);
}

.benefits li :deep(svg) {
  color: var(--ui-primary-500, #2563eb);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.create-button {
  min-width: 240px;
}

.error {
  margin: 0;
  color: #dc2626;
  font-size: 0.875rem;
}
</style>
