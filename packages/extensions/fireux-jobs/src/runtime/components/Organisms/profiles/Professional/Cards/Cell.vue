<template>
  <div class="profile-cell professional-cell" @click="navigateTo(`/professionals/${professional.id}`)">
    <!-- Avatar & Basic Info -->
    <div class="profile-header">
      <img
        :src="
          professional.avatarUrl || professional.profile_image?.url || '/default-avatar.png'
        "
        :alt="`${professional.professional_name} avatar`"
        class="profile-avatar"
      />
      <div class="profile-info">
        <h3 class="profile-name">{{ professional.professional_name }}</h3>
        <p v-if="professional.title" class="profile-title">{{ professional.title }}</p>
      </div>
    </div>

    <!-- Bio (Short) -->
    <p v-if="professional.bio_short" class="profile-bio">{{ professional.bio_short }}</p>

    <!-- Specialties -->
    <div v-if="professional.specialties?.length" class="profile-specialties">
      <span
        v-for="specialty in professional.specialties.slice(0, 3)"
        :key="specialty"
        class="specialty-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="professional.specialties.length > 3" class="more-specialties">
        +{{ professional.specialties.length - 3 }} more
      </span>
    </div>

    <!-- Gallery Preview -->
    <div v-if="professional.gallery?.length" class="profile-gallery">
      <img
        v-for="(item, index) in professional.gallery.slice(0, 3)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="gallery-thumb"
      />
      <span v-if="professional.gallery.length > 3" class="more-images">
        +{{ professional.gallery.length - 3 }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  professional: {
    type: Object,
    required: true,
  },
})
</script>
