<template>
  <div v-if="shouldRender">
    <UPageCTA
      title="Create your supplier profile"
      description="Introduce your products to chefs and venues across the FireUX network."
      variant="naked"
    >
      <template #links>
        <UButton
          color="primary"
          size="lg"
          :loading="isCreating"
          :disabled="isCreating"
          @click="handleCreate"
        >
          {{ isCreating ? 'Creating...' : 'Create supplier profile' }}
        </UButton>
      </template>
    </UPageCTA>

    <p v-if="createError" class="cta-error">{{ createError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSupplierCreate } from '../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCreate.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

const props = defineProps<{
  create?: () => Promise<unknown>
}>()

const emit = defineEmits<{
  (e: 'created', payload: unknown): void
  (e: 'error', error: unknown): void
}>()

const { createSupplier: defaultCreateSupplier } = useSupplierCreate()
const { hasProfile } = useUser()

const shouldRender = computed(() => !hasProfile('supplier'))

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
    isCreating.value = false
  }
}
</script>

<style scoped>
.cta-error {
  margin: 0;
  font-size: 0.875rem;
  color: #dc2626;
}

</style>
