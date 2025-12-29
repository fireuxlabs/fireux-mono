<template>
  <div v-if="shouldRender">
    <UPageCTA
      title="Create your professional profile"
      description="Add a professional profile to your FireUX portfolio so agents can discover you more easily."
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
          {{ isCreating ? 'Creating...' : 'Create professional profile' }}
        </UButton>
      </template>
    </UPageCTA>

    <p v-if="createError" class="cta-error">{{ createError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProfessionalCreate } from '../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCreate.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

const props = defineProps<{
  create?: () => Promise<unknown>
}>()

const emit = defineEmits<{
  (e: 'created', payload: unknown): void
  (e: 'error', error: unknown): void
}>()

const { createProfessional: defaultCreateProfessional } =
  useProfessionalCreate()
const { hasProfile } = useUser()

const shouldRender = computed(() => !hasProfile('professional'))

const isCreating = ref(false)
const createError = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  const create = props.create ?? defaultCreateProfessional

  try {
    const result = await create()
    emit('created', result)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create professional profile. Please try again.'
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
