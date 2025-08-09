<template>
  <div class="cell card-profile chef-theme">
    <div class="header">
      <img
        :src="
          chef?.avatarUrl || chef?.profile_image?.url || '/default-avatar.png'
        "
        :alt="`${chef?.chef_name || 'Chef'} avatar`"
        class="avatar"
      />
      <div class="info">
        <h2 class="name">{{ chef?.chef_name || 'Loading...' }}</h2>
        <p v-if="chef?.title" class="title">{{ chef.title }}</p>
        <div class="meta">
          <span v-if="chef?.specialties?.length" class="meta-item">
            <span>🍳</span>
            {{ chef.specialties.length }} specialties
          </span>
          <span v-if="chef?.gallery?.length" class="meta-item">
            <span>📸</span>
            {{ chef.gallery.length }} photos
          </span>
          <span
            v-if="chef?.kitchens && Object.keys(chef.kitchens).length"
            class="meta-item"
          >
            <span>🏢</span>
            {{ Object.keys(chef.kitchens).length }} kitchen{{
              Object.keys(chef.kitchens).length > 1 ? 's' : ''
            }}
          </span>
          <span v-if="chef.years_experience" class="meta-item">
            <span>⭐</span>
            {{ chef.years_experience }} years experience
          </span>
          <span v-if="chef.verified" class="meta-item">
            <span>✓</span>
            Verified Chef
          </span>
        </div>
      </div>
    </div>

    <p v-if="chef.bio_short" class="bio">{{ chef.bio_short }}</p>

    <div v-if="chef.specialties?.length" class="tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 8)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 8" class="more-tags">
        +{{ chef.specialties.length - 8 }} more
      </span>
    </div>

    <div v-if="chef.gallery?.length" class="gallery">
      <img
        v-for="(item, index) in chef.gallery.slice(0, 6)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="thumb"
      />
      <div v-if="chef.gallery.length > 6" class="more-images">
        +{{ chef.gallery.length - 6 }} more
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-primary" @click="$emit('view-profile', chef)">
        View Full Profile
      </button>
      <button class="btn btn-secondary" @click="$emit('contact-chef', chef)">
        Contact Chef
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  chef: {
    type: Object,
    required: false,
    default: () => ({
      chef_name: 'Loading...',
      title: 'Chef',
      avatarUrl: '/default-avatar.png',
    }),
  },
})

const emit = defineEmits(['view-profile', 'contact-chef'])
</script>
