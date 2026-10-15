<template>
  <section class="professional-create-system">
    <UCard class="create-card">
      <template #header>
        <div class="header">
          <div>
            <p class="eyebrow">Professional profile</p>
            <h2>Create your profile</h2>
          </div>
          <p class="lede">
            Set up a professional profile with your headline and experience. You
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
            <span>Add experience, certifications, and projects</span>
          </li>
          <li>
            <UIcon name="i-lucide-sparkles" />
            <span>Receive invites from agents and teams</span>
          </li>
        </ul>

        <div class="actions">
          <UButton
            color="primary"
            size="lg"
            class="create-button"
            :loading="isCreating"
            :disabled="isCreating"
            @click="handleCreate"
          >
            {{ isCreating ? 'Creating…' : 'Create profile' }}
          </UButton>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfessionalCreate } from '../../../composables/profiles/Professional/mutations/useProfessionalCreate'

const props = defineProps<{ create?: () => Promise<unknown> }>()

const emit = defineEmits<{
  (e: 'created', payload: unknown): void
  (e: 'error', error: unknown): void
}>()

const router = useRouter()
const { createProfessionalProfile } = useProfessionalCreate()

const isCreating = ref(false)
const errorMessage = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  const create = props.create ?? createProfessionalProfile
  isCreating.value = true
  errorMessage.value = null

  try {
    const result = await create()
    emit('created', result)
    await router.push('/dashboard/professional/profile')
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create a professional profile right now.'
    errorMessage.value = message
    emit('error', error)
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.professional-create-system {
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
  gap: calc(var(--spacing) * 2);
}

.eyebrow {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--ui-text-dimmed);
  margin: 0;
}

.header h2 {
  margin: 0;
  font-size: var(--text-2xl);
}

.lede {
  margin: 0;
  color: var(--ui-text-muted);
}

.body {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}

.benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.benefits li {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  font-size: var(--text-sm);
  color: var(--ui-text-toned);
}

.benefits li :deep(svg) {
  color: var(--ui-primary);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
  align-items: flex-start;
}

.create-button {
  min-width: 240px;
}

.error {
  margin: 0;
  color: var(--ui-error);
  font-size: var(--text-sm);
}
</style>
