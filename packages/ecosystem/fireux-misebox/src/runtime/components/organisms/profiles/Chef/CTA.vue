<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
  <div>
    <UPageCTA
      title="Create your chef profile"
      description="Showcase your culinary strengths so kitchens can match you to the right stations and menus."
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
            {{ isCreating ? 'Creating...' : 'Create chef profile' }}
          </UButton>

          <UButton
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide-arrow-right"
            to="/chefs/learn-more"
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
import { useChefCreate } from '../../../../composables/firestore/profiles/Chef/main/useChefCreate.ts'

const props = defineProps<{
  create?: () => Promise<unknown>
}>()

const emit = defineEmits<{
  (e: 'created', payload: unknown): void
  (e: 'error', error: unknown): void
}>()

const { createChef: defaultCreateChef } = useChefCreate()

const isCreating = ref(false)
const createError = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  const create = props.create ?? defaultCreateChef

  try {
    const result = await create()
    emit('created', result)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create chef profile. Please try again.'
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
