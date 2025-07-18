<template>
  <div class="chef-card">
    <div class="card-header">
      <img
        v-if="chef.profile_image"
        :src="chef.profile_image.url"
        :alt="`${chef.chef_name} profile`"
        class="profile-image medium"
      />
      <div class="chef-info">
        <h3>{{ chef.chef_name }}</h3>
        <p v-if="chef.title" class="title">{{ chef.title }}</p>
        <div v-if="chef.years_experience" class="experience">
          {{ chef.years_experience }} years experience
        </div>
        <div v-if="chef.availability_status" class="availability">
          {{ formatAvailabilityStatus(chef.availability_status) }}
        </div>
      </div>
    </div>

    <p v-if="chef.bio_short" class="bio">{{ chef.bio_short }}</p>

    <div v-if="chef.specialties?.length" class="specialties">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="specialty-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 3" class="more-count">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>

    <div class="badges">
      <span v-if="chef.verified" class="badge verified">✓ Verified</span>
      <span v-if="chef.featured" class="badge featured">★ Featured</span>
      <span v-if="chef.hourly_rate" class="badge rate"
        >{{ chef.hourly_rate }} CHF/hr</span
      >
    </div>

    <div class="card-footer">
      <div class="stats">
        <span v-if="chef.total_kitchens" class="stat">
          {{ chef.total_kitchens }} kitchens
        </span>
        <span v-if="chef.total_recipes" class="stat">
          {{ chef.total_recipes }} recipes
        </span>
      </div>

      <div class="actions">
        <button class="btn-primary" @click="$emit('view-profile', chef)">
          View Profile
        </button>
        <button class="btn-secondary" @click="$emit('contact-chef', chef)">
          Contact
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['view-profile', 'contact-chef'])

const formatAvailabilityStatus = (status) => {
  const statuses = {
    available: 'Available',
    busy: 'Busy',
    unavailable: 'Unavailable',
  }
  return statuses[status] || status
}
</script>

<style scoped>
.chef-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;
}

.chef-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  margin-bottom: 15px;
}

.chef-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.25rem;
  color: #111827;
}

.title {
  color: #6b7280;
  margin: 0 0 5px 0;
  font-size: 0.9rem;
}

.experience {
  background: #f0f9ff;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-block;
  margin-bottom: 5px;
}

.availability {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-block;
}

.bio {
  color: #4b5563;
  margin-bottom: 15px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
}

.specialty-tag {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.more-count {
  color: #6b7280;
  font-size: 0.8rem;
  padding: 4px 8px;
}

.badges {
  display: flex;
  gap: 6px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.verified {
  background: #dcfce7;
  color: #166534;
}

.badge.featured {
  background: #fef3c7;
  color: #92400e;
}

.badge.rate {
  background: #e0e7ff;
  color: #3730a3;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.stats {
  display: flex;
  gap: 15px;
}

.stat {
  color: #6b7280;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
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
  color: #22c55e;
  border: 1px solid #22c55e;
}

.btn-secondary:hover {
  background: #22c55e;
  color: white;
}

.profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}
</style>
