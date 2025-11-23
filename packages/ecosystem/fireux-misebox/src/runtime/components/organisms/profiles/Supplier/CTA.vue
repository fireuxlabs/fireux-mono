<template>
  <div>
    <UPageCTA
      title="Create your supplier profile"
      description="Introduce your products to chefs and venues across the FireUX network."
      variant="naked"
    >
      <template #links>
        <div class="cta-links">
          <UButton
            color="primary"
            size="lg"
            :loading="isCreating"
            :disabled="isCreating"
            @click="handleCreate"
          >
            {{ isCreating ? 'Creating...' : 'Create supplier profile' }}
          </UButton>

          <UButton
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide-arrow-right"
            to="/suppliers/learn-more"
          >
            Learn more
          </UButton>
        </div>
      </template>
    </UPageCTA>

    <p v-if="createError" class="cta-error">{{ createError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupplierCreate } from '../../../../composables/firestore/profiles/Supplier/main/useSupplierCreate.ts'

const props = defineProps<{
  create?: () => Promise<unknown>
}>()

const emit = defineEmits<{
  (e: 'created', payload: unknown): void
  (e: 'error', error: unknown): void
}>()

const { createSupplier: defaultCreateSupplier } = useSupplierCreate()

const isCreating = ref(false)
const createError = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  const create = props.create ?? defaultCreateSupplier

  try {
    const result = await create()
    emit('created', result)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create supplier profile. Please try again.'
    createError.value = message
    emit('error', error)
  } finally {
    if (createError.value) {
      isCreating.value = false
    }
  }
}
</script>

<style scoped>
.cta-error {
  margin: 0;
  font-size: 0.875rem;
  color: #dc2626;
}

.cta-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}
</style>
