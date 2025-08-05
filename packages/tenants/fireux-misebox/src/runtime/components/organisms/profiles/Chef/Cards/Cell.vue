<template>
  <div class="profile-cell chef-cell">
    <!-- Avatar & Basic Info -->
    <div class="profile-header">
      <img
        :src="
          chef.avatarUrl || chef.profile_image?.url || '/default-avatar.png'
        "
        :alt="`${chef.chef_name} avatar`"
        class="profile-avatar"
      />
      <div class="profile-info">
        <h3 class="profile-name">{{ chef.chef_name }}</h3>
        <p v-if="chef.title" class="profile-title">{{ chef.title }}</p>
      </div>
    </div>

    <!-- Bio (Short) -->
    <p v-if="chef.bio_short" class="profile-bio">{{ chef.bio_short }}</p>

    <!-- Specialties -->
    <div v-if="chef.specialties?.length" class="profile-specialties">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="specialty-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 3" class="more-specialties">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>

    <!-- Gallery Preview -->
    <div v-if="chef.gallery?.length" class="profile-gallery">
      <img
        v-for="(item, index) in chef.gallery.slice(0, 3)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="gallery-thumb"
      />
      <span v-if="chef.gallery.length > 3" class="more-images">
        +{{ chef.gallery.length - 3 }}
      </span>
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
</script>

<style scoped>
/* Domain-specific styles handled by shared CSS classes */
</style>
