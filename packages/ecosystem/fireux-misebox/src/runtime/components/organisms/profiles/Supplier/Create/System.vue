<template>
  <div class="supplier full-create profile-create">
    <div class="form-header">
      <h2>🚛 Create Your Full Supplier Profile</h2>
      <p>
        Join the marketplace as a verified supplier to manage your own profile
        and sell excess production
      </p>

      <div class="track-info">
        <div class="track-note">
          <strong>💡 Two ways to work with suppliers:</strong>
          <ul>
            <li>
              <strong>Quick Track:</strong> Chefs can quickly create supplier
              names when adding ingredients
            </li>
            <li>
              <strong>Full Track:</strong> Suppliers create rich profiles to
              manage their own presence and ingredients
            </li>
          </ul>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="profile-form">
      <!-- Essential Information -->
      <div class="form-section">
        <h3>Essential Business Information</h3>

        <div class="form-field">
          <label for="business_name">Business Name *</label>
          <input
            id="business_name"
            v-model="formData.business_name"
            type="text"
            placeholder="e.g., Fresh Valley Farm"
            required
          />
        </div>

        <div class="form-field">
          <label for="business_type">Business Type *</label>
          <select id="business_type" v-model="formData.business_type" required>
            <option value="">Select your business type</option>
            <option value="farm">Farm</option>
            <option value="distributor">Distributor</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="producer">Producer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-field tags-input">
          <label for="specialties">What do you supply? *</label>
          <input
            id="specialties"
            v-model="specialtiesInput"
            type="text"
            placeholder="e.g., Organic Vegetables, Dairy Products, Fresh Herbs"
            @blur="updateSpecialties"
            @keydown.enter.prevent="updateSpecialties"
          />
          <small>Press Enter or click away to add each specialty</small>
          <div v-if="formData.specialties?.length" class="tags-preview">
            <span
              v-for="specialty in formData.specialties"
              :key="specialty"
              class="tag"
            >
              {{ specialty }}
              <button type="button" @click="removeSpecialty(specialty)">
                ×
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="form-section">
        <h3>Contact Information</h3>

        <div class="form-field">
          <label for="email">Business Email *</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="business@example.com"
            required
          />
        </div>

        <div class="form-field">
          <label for="contact_person">Contact Person</label>
          <input
            id="contact_person"
            v-model="formData.contact_person"
            type="text"
            placeholder="Primary contact name"
          />
        </div>

        <div class="form-field">
          <label for="phone">Phone Number</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="Business phone"
          />
        </div>
      </div>

      <!-- Optional Details -->
      <div class="form-section">
        <h3>Additional Details (Optional)</h3>

        <div class="form-field">
          <label for="bio_short">Business Description</label>
          <textarea
            id="bio_short"
            v-model="formData.bio_short"
            rows="3"
            placeholder="Brief description of your business and what makes you unique"
          ></textarea>
        </div>

        <div class="form-field">
          <label for="years_in_business">Years in Business</label>
          <input
            id="years_in_business"
            v-model.number="formData.years_in_business"
            type="number"
            placeholder="How long have you been operating?"
            min="0"
          />
        </div>

        <div class="form-field">
          <label for="website">Website</label>
          <input
            id="website"
            v-model="formData.website"
            type="url"
            placeholder="https://your-website.com"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button
          type="submit"
          class="btn-primary"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? 'Creating Profile...' : 'Create Supplier Profile' }}
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

const emit = defineEmits(['submit', 'cancel', 'success'])

const currentUser = useCurrentUser()
const isSubmitting = ref(false)
const error = ref('')
const specialtiesInput = ref('')

// Simplified form data matching our new Supplier model
const formData = ref({
  business_name: '',
  business_type: '',
  specialties: [],
  email: '',
  contact_person: '',
  phone: '',
  bio_short: '',
  years_in_business: null,
  website: '',

  // Default values
  total_ingredients: 0,
  active_ingredients: [],
  verified: false,
  featured: false,
})

const canSubmit = computed(() => {
  return (
    formData.value.business_name.trim().length > 0 &&
    formData.value.business_type.length > 0 &&
    formData.value.specialties.length > 0 &&
    formData.value.email.trim().length > 0
  )
})

// Specialties management
const updateSpecialties = () => {
  if (specialtiesInput.value.trim()) {
    const newSpecialties = specialtiesInput.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .filter((s) => !formData.value.specialties.includes(s))

    formData.value.specialties.push(...newSpecialties)
    specialtiesInput.value = ''
  }
}

const removeSpecialty = (specialty) => {
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
  } catch (err) {
    console.error('Error creating supplier profile:', err)
    error.value = err.message || 'Failed to create profile. Please try again.'
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
