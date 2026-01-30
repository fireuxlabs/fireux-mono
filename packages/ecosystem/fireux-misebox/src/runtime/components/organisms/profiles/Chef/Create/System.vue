<template>
  <section class="profile-create-system">
    <UCard class="create-card">
      <template #header>
        <div class="header">
          <div>
            <p class="eyebrow">Chef profile</p>
            <h2>Create your profile</h2>
          </div>
          <p class="lede">
            Set up a chef profile with your specialties and experience. You can
            edit everything right after creating it.
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
            <span>Add specialties, experience, and projects</span>
          </li>
          <li>
            <UIcon name="i-lucide-sparkles" />
            <span>Receive invites from kitchens and teams</span>
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
import { useChefCreate } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefCreate'

const props = defineProps<{ create?: () => Promise<unknown> }>()

const emit = defineEmits<{
  (e: 'created', payload: unknown): void
  (e: 'error', error: unknown): void
}>()

const router = useRouter()
const { ensureChef } = useChefCreate()

const isCreating = ref(false)
const errorMessage = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  const create = props.create ?? ensureChef
  isCreating.value = true
  errorMessage.value = null

  try {
    const result = await create()
    emit('created', result)
    await router.push('/dashboard/chef/profile')
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create a chef profile right now.'
    errorMessage.value = message
    emit('error', error)
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.profile-create-system {
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
  const index = formData.value.cuisine_expertise.indexOf(cuisine)
  if (index > -1) {
    formData.value.cuisine_expertise.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Clean up the data
    const submitData = {
      ...formData.value,
      chef_name: formData.value.chef_name.trim(),
      title: formData.value.title?.trim() || undefined,
      bio_short: formData.value.bio_short?.trim() || undefined,
      bio_long: formData.value.bio_long?.trim() || undefined,
      created_at: new Date(),
      updated_at: new Date(),
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.chef-create-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  margin: 0 0 8px 0;
  color: #111827;
}

.form-header p {
  color: #6b7280;
  margin: 0;
}

.chef-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #f9fafb;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 1.1rem;
}

.form-field {
  margin-bottom: 16px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-field input[type='text'],
.form-field input[type='number'],
.form-field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-field label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-field input[type='checkbox'] {
  width: auto;
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.tag button:hover {
  background: #d1d5db;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
}
</style>
