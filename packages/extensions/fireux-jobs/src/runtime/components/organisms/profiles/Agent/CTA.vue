<template>
  <div>
    <UPageCTA
      title="Create your agent profile"
      description="Add an agent profile to your FireUX portfolio so talent knows who is hiring."
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
          {{ isCreating ? 'Creating...' : 'Create agent profile' }}
        </UButton>
      </template>
    </UPageCTA>

    <p v-if="createError" class="cta-error">{{ createError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAgentCreate } from '../../../../composables/fireux/firestore/profiles/Agent/main/useAgentCreate.ts'

const { createAgent } = useAgentCreate()

const isCreating = ref(false)
const createError = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  try {
    await createAgent()
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create agent profile. Please try again.'
    createError.value = message
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
