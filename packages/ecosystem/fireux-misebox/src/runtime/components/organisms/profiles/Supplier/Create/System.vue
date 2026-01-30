<template>
  <section class="profile-create-system">
    <UCard class="create-card">
      <template #header>
        <div class="header">
          <div>
            <p class="eyebrow">Supplier profile</p>
            <h2>Create your profile</h2>
          </div>
          <p class="lede">
            Set up a supplier profile with your products and capabilities. You
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
import { useSupplierCreate } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCreate'

const props = defineProps<{ create?: () => Promise<unknown> }>()

const emit = defineEmits<{
  (e: 'created', payload: unknown): void
  (e: 'error', error: unknown): void
}>()

const router = useRouter()
const { ensureSupplier } = useSupplierCreate()

const isCreating = ref(false)
const errorMessage = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  const create = props.create ?? ensureSupplier
  isCreating.value = true
  errorMessage.value = null

  try {
    const result = await create()
    emit('created', result)
    await router.push('/dashboard/supplier/profile')
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create a supplier profile right now.'
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
      .filter((s: string) => s.length > 0)
      .filter((s: string) => !formData.value.specialties.includes(s))

    formData.value.specialties.push(...newSpecialties)
    specialtiesInput.value = ''
  }
}

const removeSpecialty = (specialty: string) => {
  const index = formData.value.specialties.indexOf(specialty)
  if (index > -1) {
    formData.value.specialties.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true
  error.value = ''

  try {
    // Generate auto-generated ID for independent supplier entity
    const supplierId =
      formData.value.business_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-)|(-$)/g, '') +
      '-' +
      Date.now().toString(36)

    // Clean up the data for submission
    const submitData = {
      // Use auto-generated ID, not user UID
      uid: supplierId,
      id: supplierId,

      // Core supplier data
      business_name: formData.value.business_name.trim(),
      business_type: formData.value.business_type,
      specialties: formData.value.specialties,

      // Contact info (for full profiles)
      email: formData.value.email.trim(),
      contact_person: formData.value.contact_person?.trim() || undefined,
      phone: formData.value.phone?.trim() || undefined,
      bio_short: formData.value.bio_short?.trim() || undefined,
      years_in_business: formData.value.years_in_business || undefined,
      website: formData.value.website?.trim() || undefined,

      // Claim system - full profiles start as claimed
      claimed: true, // Full profile creation means it's claimed
      claimed_by: currentUser.value?.uid, // User who created it claims it
      created_by: currentUser.value?.uid, // Same user created and claimed it

      // Default values
      total_ingredients: 0,
      verified: false,
      featured: false,

      // Generic avatar for supplier
      avatarUrl: '/default-supplier-avatar.png',
    }

    // Use Firestore directly instead of profile system (since suppliers are independent entities)
    const db = useFirestore()
    const supplierRef = doc(db, 'suppliers', supplierId)
    await setDoc(supplierRef, {
      ...submitData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })

    emit('success')
    emit('submit', submitData)
  } catch (err: unknown) {
    console.error('Error creating supplier profile:', err)
    const message = err instanceof Error ? err.message : null
    error.value = message || 'Failed to create profile. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* 
 * Supplier-specific styling only
 * Most form styling comes from generic profile-create classes in core
 */

/* Domain-specific track info styling */
.supplier .track-info {
  background: var(--blue-50, #eff6ff);
  border: 1px solid var(--blue-200, #bfdbfe);
}

.supplier .track-note {
  color: var(--blue-700, #1d4ed8);
}

.supplier .track-note ul {
  color: var(--blue-600, #2563eb);
}

/* Supplier-specific tag styling */
.supplier .tags-input .tag {
  background: var(--blue-100, #dbeafe);
  color: var(--blue-700, #1d4ed8);
  border: 1px solid var(--blue-200, #bfdbfe);
}

/* Primary button supplier branding */
.supplier .btn-primary {
  background: var(--blue-600, #2563eb);
}

.supplier .btn-primary:hover:not(:disabled) {
  background: var(--blue-700, #1d4ed8);
}
</style>
