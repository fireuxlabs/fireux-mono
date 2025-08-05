<template>
  <div class="profile-cell supplier-cell">
    <!-- Avatar & Basic Info -->
    <div class="profile-header">
      <img
        :src="
          supplier.avatarUrl || supplier.profile_image?.url || '/default-avatar.png'
        "
        :alt="`${supplier.business_name} avatar`"
        class="profile-avatar"
      />
      <div class="profile-info">
        <h3 class="profile-name">{{ supplier.business_name }}</h3>
        <p v-if="supplier.title" class="profile-title">{{ supplier.title }}</p>
      </div>
    </div>

    <!-- Bio (Short) -->
    <p v-if="supplier.bio_short" class="profile-bio">{{ supplier.bio_short }}</p>

    <!-- Specialties -->
    <div v-if="supplier.specialties?.length" class="profile-specialties">
      <span
        v-for="specialty in supplier.specialties.slice(0, 3)"
        :key="specialty"
        class="specialty-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="supplier.specialties.length > 3" class="more-specialties">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>

    <!-- Gallery Preview -->
    <div v-if="supplier.gallery?.length" class="profile-gallery">
      <img
        v-for="(item, index) in supplier.gallery.slice(0, 3)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="gallery-thumb"
      />
      <span v-if="supplier.gallery.length > 3" class="more-images">
        +{{ supplier.gallery.length - 3 }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})
</script>
