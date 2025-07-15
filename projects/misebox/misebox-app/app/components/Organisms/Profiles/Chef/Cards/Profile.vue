<template>
  <div class="chef-profile-card">
    <div class="card-header">
      <FireAtomsImagesProfileImage
        v-if="chef.profile_image"
        :src="chef.profile_image.url"
        :alt="`${chef.chef_name} profile`"
        size="large"
      />
      <div class="chef-details">
        <h2>{{ chef.chef_name }}</h2>
        <h3 v-if="chef.title">{{ chef.title }}</h3>
        <p v-if="chef.bio_short" class="bio">{{ chef.bio_short }}</p>

        <div class="badges">
          <span v-if="chef.years_experience" class="badge experience">
            {{ chef.years_experience }} years experience
          </span>
          <span v-if="chef.verified" class="badge verified">
            ✓ Verified Chef
          </span>
          <span v-if="chef.available_for_hire" class="badge available">
            Available for hire
          </span>
        </div>
      </div>
    </div>

    <div v-if="chef.specialties?.length" class="specialties-section">
      <h4>Specialties</h4>
      <div class="tags">
        <span
          v-for="specialty in chef.specialties"
          :key="specialty"
          class="tag"
        >
          {{ specialty }}
        </span>
      </div>
    </div>

    <div v-if="chef.cuisine_expertise?.length" class="cuisine-section">
      <h4>Cuisine Expertise</h4>
      <div class="tags">
        <span
          v-for="cuisine in chef.cuisine_expertise"
          :key="cuisine"
          class="tag cuisine"
        >
          {{ cuisine }}
        </span>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-grid">
        <div v-if="chef.total_recipes" class="stat">
          <span class="stat-number">{{ chef.total_recipes }}</span>
          <span class="stat-label">Recipes</span>
        </div>
        <div v-if="chef.total_followers" class="stat">
          <span class="stat-number">{{ chef.total_followers }}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div v-if="chef.total_likes" class="stat">
          <span class="stat-number">{{ chef.total_likes }}</span>
          <span class="stat-label">Likes</span>
        </div>
        <div v-if="chef.chef_experience?.length" class="stat">
          <span class="stat-number">{{ chef.chef_experience.length }}</span>
          <span class="stat-label">Venues</span>
        </div>
      </div>
    </div>

    <div v-if="chef.gallery?.length" class="gallery-preview">
      <h4>Recent Work</h4>
      <div class="gallery-grid">
        <img
          v-for="item in chef.gallery.slice(0, 4)"
          :key="item.name"
          :src="item.image_url"
          :alt="item.name"
          class="gallery-image"
        />
      </div>
    </div>

    <div class="action-section">
      <button
        class="btn-primary full-width"
        @click="$emit('view-full-profile', chef)"
      >
        View Full Profile
      </button>

      <div class="secondary-actions">
        <button
          v-if="chef.available_for_hire"
          class="btn-secondary"
          @click="$emit('contact-chef', chef)"
        >
          Contact Chef
        </button>
        <button class="btn-secondary" @click="$emit('view-recipes', chef)">
          View Recipes
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

const emit = defineEmits(['view-full-profile', 'contact-chef', 'view-recipes'])
</script>

<style scoped>
.chef-profile-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  max-width: 400px;
}

.card-header {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.chef-details h2 {
  margin: 0 0 5px 0;
  font-size: 1.5rem;
  color: #111827;
}

.chef-details h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #6b7280;
  font-weight: 500;
}

.bio {
  color: #4b5563;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge.experience {
  background: #f3f4f6;
  color: #374151;
}

.badge.verified {
  background: #dcfce7;
  color: #166534;
}

.badge.available {
  background: #dbeafe;
  color: #1d4ed8;
}

.specialties-section,
.cuisine-section {
  margin-bottom: 20px;
}

.specialties-section h4,
.cuisine-section h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #374151;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #f9fafb;
  color: #374151;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  border: 1px solid #e5e7eb;
}

.tag.cuisine {
  background: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.stats-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
}

.gallery-preview {
  margin-bottom: 24px;
}

.gallery-preview h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: #374151;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.gallery-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.secondary-actions {
  display: flex;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary.full-width {
  width: 100%;
}

.btn-secondary {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  flex: 1;
}

.btn-secondary:hover {
  background: #f0f9ff;
}
</style>
