<template>
  <div class="supplier-create-form">
    <div class="form-header">
      <h2>Create Your Supplier Profile</h2>
      <p>
        Connect with restaurants, chefs, and businesses in need of quality
        supplies
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="supplier-form">
      <!-- Basic Information -->
      <div class="form-section">
        <h3>Business Information</h3>

        <div class="form-field">
          <label for="business_name">Business Name *</label>
          <input
            id="business_name"
            v-model="formData.business_name"
            type="text"
            placeholder="Enter your business name"
            required
          />
        </div>

        <div class="form-field">
          <label for="email">Business Email *</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Enter business email"
            required
          />
        </div>

        <div class="form-field">
          <label for="title">Your Title/Role</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="e.g., Owner, Sales Manager"
          />
        </div>

        <div class="form-field">
          <label for="business_type">Business Type *</label>
          <select id="business_type" v-model="formData.business_type" required>
            <option value="">Select business type</option>
            <option value="farm">Farm</option>
            <option value="distributor">Distributor</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="producer">Producer</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="form-section">
        <h3>Contact Details</h3>

        <div class="form-field">
          <label for="contact_person">Contact Person</label>
          <input
            id="contact_person"
            v-model="formData.contact_person"
            type="text"
            placeholder="Primary contact person name"
          />
        </div>

        <div class="form-field">
          <label for="phone">Phone Number</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="Business phone number"
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

      <!-- Business Description -->
      <div class="form-section">
        <h3>About Your Business</h3>

        <div class="form-field">
          <label for="bio_short">Short Description</label>
          <textarea
            id="bio_short"
            v-model="formData.bio_short"
            rows="3"
            placeholder="Brief business description"
          ></textarea>
        </div>

        <div class="form-field">
          <label for="bio_long">Detailed Description</label>
          <textarea
            id="bio_long"
            v-model="formData.bio_long"
            rows="6"
            placeholder="Detailed business description and services offered"
          ></textarea>
        </div>
      </div>

      <!-- Business Details -->
      <div class="form-section">
        <h3>Business Details</h3>

        <div class="form-field">
          <label for="years_in_business">Years in Business</label>
          <input
            id="years_in_business"
            v-model.number="formData.years_in_business"
            type="number"
            placeholder="How many years have you been in business?"
            min="0"
          />
        </div>

        <div class="form-field">
          <label for="employee_count">Employee Count</label>
          <input
            id="employee_count"
            v-model.number="formData.employee_count"
            type="number"
            placeholder="Number of employees"
            min="0"
          />
        </div>

        <div class="form-field">
          <label for="annual_capacity">Annual Capacity</label>
          <input
            id="annual_capacity"
            v-model="formData.annual_capacity"
            type="text"
            placeholder="e.g., 500 tons, 10,000 units"
          />
        </div>
      </div>

      <!-- Specialties & Services -->
      <div class="form-section">
        <h3>Specialties & Services</h3>

        <div class="form-field">
          <label for="specialties">Product Specialties</label>
          <input
            id="specialties"
            v-model="specialtiesInput"
            type="text"
            placeholder="e.g., Organic Vegetables, Dairy Products (comma separated)"
            @blur="updateSpecialties"
          />
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

        <div class="form-field">
          <label for="client_types">Client Types Served</label>
          <input
            id="client_types"
            v-model="clientTypesInput"
            type="text"
            placeholder="e.g., Restaurants, Hotels, Catering (comma separated)"
            @blur="updateClientTypes"
          />
          <div v-if="formData.client_types?.length" class="tags-preview">
            <span
              v-for="clientType in formData.client_types"
              :key="clientType"
              class="tag"
            >
              {{ clientType }}
              <button type="button" @click="removeClientType(clientType)">
                ×
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Business Features -->
      <div class="form-section">
        <h3>Business Features</h3>

        <div class="form-field checkbox-field">
          <label>
            <input v-model="formData.bulk_discounts" type="checkbox" />
            Offer bulk discounts
          </label>
        </div>

        <div class="form-field checkbox-field">
          <label>
            <input v-model="formData.seasonal_pricing" type="checkbox" />
            Seasonal pricing available
          </label>
        </div>

        <div class="form-field checkbox-field">
          <label>
            <input v-model="formData.verified" type="checkbox" />
            Business is verified
          </label>
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
          {{ isSubmitting ? 'Creating...' : 'Create Profile' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const isSubmitting = ref(false)
const specialtiesInput = ref('')
const clientTypesInput = ref('')

const formData = ref({
  business_name: '',
  email: '',
  title: '',
  business_type: '',
  contact_person: '',
  phone: '',
  website: '',
  bio_short: '',
  bio_long: '',
  years_in_business: null,
  employee_count: null,
  annual_capacity: '',
  specialties: [],
  client_types: [],
  bulk_discounts: false,
  seasonal_pricing: false,
  verified: false,
})

const canSubmit = computed(() => {
  return (
    formData.value.business_name.trim().length > 0 &&
    formData.value.email.trim().length > 0 &&
    formData.value.business_type.length > 0
  )
})

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

const updateClientTypes = () => {
  if (clientTypesInput.value.trim()) {
    const newClientTypes = clientTypesInput.value
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .filter((c) => !formData.value.client_types.includes(c))

    formData.value.client_types.push(...newClientTypes)
    clientTypesInput.value = ''
  }
}

const removeClientType = (clientType) => {
  const index = formData.value.client_types.indexOf(clientType)
  if (index > -1) {
    formData.value.client_types.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Clean up the data
    const submitData = {
      ...formData.value,
      business_name: formData.value.business_name.trim(),
      email: formData.value.email.trim(),
      title: formData.value.title?.trim() || undefined,
      contact_person: formData.value.contact_person?.trim() || undefined,
      phone: formData.value.phone?.trim() || undefined,
      website: formData.value.website?.trim() || undefined,
      bio_short: formData.value.bio_short?.trim() || undefined,
      bio_long: formData.value.bio_long?.trim() || undefined,
      annual_capacity: formData.value.annual_capacity?.trim() || undefined,
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
.supplier-create-form {
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

.supplier-form {
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
.form-field input[type='email'],
.form-field input[type='tel'],
.form-field input[type='url'],
.form-field input[type='number'],
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.form-field input:focus,
.form-field select:focus,
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
