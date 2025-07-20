<template>
  <div class="chef-edit">
    <h2>Edit Chef Profile</h2>

    <form @submit.prevent="handleSubmit" class="chef-form">
      <div class="form-group">
        <label for="chef_name">Chef Name</label>
        <input
          id="chef_name"
          v-model="chef.chef_name"
          type="text"
          required
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="chef.title"
          type="text"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="bio_short">Short Bio</label>
        <textarea
          id="bio_short"
          v-model="chef.bio_short"
          class="form-control"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="years_experience">Years of Experience</label>
        <input
          id="years_experience"
          v-model.number="chef.years_experience"
          type="number"
          min="0"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="availability_status">Availability Status</label>
        <select
          id="availability_status"
          v-model="chef.availability_status"
          class="form-control"
        >
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      <div class="form-group">
        <label for="hourly_rate">Hourly Rate (CHF)</label>
        <input
          id="hourly_rate"
          v-model.number="chef.hourly_rate"
          type="number"
          min="0"
          step="5"
          class="form-control"
        />
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary">Save Chef Profile</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  initialChef: {
    type: Object,
    default: () => ({
      chef_name: '',
      title: '',
      bio_short: '',
      years_experience: 0,
      availability_status: 'available',
      hourly_rate: 0,
      verified: false,
      featured: false,
    }),
  },
})

const emit = defineEmits(['save', 'cancel'])

const chef = ref({ ...props.initialChef })

const handleSubmit = () => {
  emit('save', chef.value)
}
</script>

<style scoped>
.chef-edit {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.chef-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #22c55e;
  color: white;
}

.btn-primary:hover {
  background: #16a34a;
}

.btn-secondary {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

h2 {
  margin-bottom: 30px;
  color: #111827;
  text-align: center;
}
</style>
