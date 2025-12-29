<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
  <div v-if="shouldRender">
    <UPageCTA
      title="Create your chef profile"
      description="Showcase your culinary strengths so kitchens can match you to the right stations and menus."
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
          {{ isCreating ? 'Creating...' : 'Create chef profile' }}
        </UButton>
      </template>
    </UPageCTA>

    <p v-if="createError" class="cta-error">{{ createError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChefCreate } from '../../../../composables/fireux/firestore/profiles/Chef/main/useChefCreate.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

const props = defineProps<{
  create?: () => Promise<unknown>
}>()

const emit = defineEmits<{
  (e: 'created', payload: unknown): void
  (e: 'error', error: unknown): void
}>()

const { createChef: defaultCreateChef } = useChefCreate()
const { hasProfile } = useUser()

const shouldRender = computed(() => !hasProfile('chef'))

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
