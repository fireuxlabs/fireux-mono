<template>
  <div class="chef-create-form">
    <div class="form-header">
      <h2>Create Your Chef Profile</h2>
      <p>Share your culinary expertise and connect with opportunities</p>
    </div>

    <form @submit.prevent="handleSubmit" class="chef-form">
      <!-- Basic Information -->
      <div class="form-section">
        <h3>Basic Information</h3>

        <div class="form-field">
          <label for="chef_name">Chef Name *</label>
          <input
            id="chef_name"
            v-model="formData.chef_name"
            type="text"
            placeholder="e.g., Chef Marco, Chef Deano"
            required
          />
        </div>

        <div class="form-field">
          <label for="title">Chef Title</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="e.g., Executive Chef, Pastry Chef"
          />
        </div>

        <div class="form-field">
          <label for="years_experience">Years of Experience</label>
          <input
            id="years_experience"
            v-model.number="formData.years_experience"
            type="number"
            placeholder="Total years as a chef"
            min="0"
          />
        </div>
      </div>

      <!-- Biography -->
      <div class="form-section">
        <h3>About You</h3>

        <div class="form-field">
          <label for="bio_short">Short Bio</label>
          <textarea
            id="bio_short"
            v-model="formData.bio_short"
            rows="3"
            placeholder="Brief chef introduction"
          ></textarea>
        </div>

        <div class="form-field">
          <label for="bio_long">Detailed Bio</label>
          <textarea
            id="bio_long"
            v-model="formData.bio_long"
            rows="6"
            placeholder="Detailed chef biography and culinary journey"
          ></textarea>
        </div>
      </div>

      <!-- Specialties & Expertise -->
      <div class="form-section">
        <h3>Culinary Expertise</h3>

        <div class="form-field">
          <label for="specialties">Specialties</label>
          <input
            id="specialties"
            v-model="specialtiesInput"
            type="text"
            placeholder="e.g., Italian, French, Pastry (comma separated)"
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
          <label for="cuisine_expertise">Cuisine Expertise</label>
          <input
            id="cuisine_expertise"
            v-model="cuisineInput"
            type="text"
            placeholder="e.g., Mediterranean, Asian Fusion (comma separated)"
            @blur="updateCuisineExpertise"
          />
          <div v-if="formData.cuisine_expertise?.length" class="tags-preview">
            <span
              v-for="cuisine in formData.cuisine_expertise"
              :key="cuisine"
              class="tag"
            >
              {{ cuisine }}
              <button type="button" @click="removeCuisineExpertise(cuisine)">
                ×
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Availability -->
      <div class="form-section">
        <h3>Availability</h3>

        <div class="form-field checkbox-field">
          <label>
            <input v-model="formData.available_for_hire" type="checkbox" />
            Available for hire
          </label>
        </div>

        <div v-if="formData.available_for_hire" class="form-field">
          <label for="hourly_rate">Hourly Rate (CHF)</label>
          <input
            id="hourly_rate"
            v-model.number="formData.hourly_rate"
            type="number"
            placeholder="Your hourly rate"
            min="0"
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
const cuisineInput = ref('')

const formData = ref({
  chef_name: '',
  title: '',
  years_experience: null,
  bio_short: '',
  bio_long: '',
  specialties: [],
  cuisine_expertise: [],
  available_for_hire: false,
  hourly_rate: null,
})

const canSubmit = computed(() => {
  return formData.value.chef_name.trim().length > 0
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

const updateCuisineExpertise = () => {
  if (cuisineInput.value.trim()) {
    const newCuisines = cuisineInput.value
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .filter((c) => !formData.value.cuisine_expertise.includes(c))

    formData.value.cuisine_expertise.push(...newCuisines)
    cuisineInput.value = ''
  }
}

const removeCuisineExpertise = (cuisine) => {
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
