<template>
  <div
    class="profile-cell employer-cell"
    @click="navigateTo(`/employers/${employer.id}`)"
  >
    <!-- Avatar & Basic Info -->
    <div class="profile-header">
      <img
        :src="
          employer.avatarUrl ||
          employer.profile_image?.url ||
          '/default-avatar.png'
        "
        :alt="`${employer.company_name} avatar`"
        class="profile-avatar"
      />
      <div class="profile-info">
        <h3 class="profile-name">{{ employer.company_name }}</h3>
        <p v-if="employer.title" class="profile-title">{{ employer.title }}</p>
      </div>
    </div>

    <!-- Bio (Short) -->
    <p v-if="employer.bio_short" class="profile-bio">
      {{ employer.bio_short }}
    </p>

    <!-- Specialties -->
    <div v-if="employer.specialties?.length" class="profile-specialties">
      <span
        v-for="specialty in employer.specialties.slice(0, 3)"
        :key="specialty"
        class="specialty-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="employer.specialties.length > 3" class="more-specialties">
        +{{ employer.specialties.length - 3 }} more
      </span>
    </div>

    <!-- Gallery Preview -->
    <div v-if="employer.gallery?.length" class="profile-gallery">
      <img
        v-for="(item, index) in employer.gallery.slice(0, 3)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="gallery-thumb"
      />
      <span v-if="employer.gallery.length > 3" class="more-images">
        +{{ employer.gallery.length - 3 }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  employer: {
    type: Object,
    required: true,
  },
})
</script>
