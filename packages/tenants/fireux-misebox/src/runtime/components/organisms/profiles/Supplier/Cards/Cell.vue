<template>
  <div class="profile-cell supplier-theme">
    <div class="cell-header">
      <img
        :src="
          supplier?.avatarUrl ||
          supplier?.profile_image?.url ||
          '/default-avatar.png'
        "
        :alt="`${supplier?.business_name || supplier?.displayName || 'Supplier'} avatar`"
        class="cell-avatar"
      />
      <div class="cell-info">
        <h3 class="cell-name">
          {{
            supplier?.business_name ||
            supplier?.displayName ||
            supplier?.name ||
            'Loading...'
          }}
        </h3>
        <p class="cell-subtitle">
          {{ supplier?.title || supplier?.business_type || 'Supplier' }}
        </p>
      </div>
    </div>

    <p v-if="supplier?.bio_short" class="cell-bio">{{ supplier.bio_short }}</p>

    <div v-if="supplier?.specialties?.length" class="cell-tags">
      <span
        v-for="specialty in supplier.specialties.slice(0, 3)"
        :key="specialty"
        class="cell-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="supplier.specialties.length > 3" class="cell-more-tags">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>

    <div v-if="supplier?.gallery?.length" class="cell-gallery">
      <img
        v-for="(item, index) in supplier.gallery.slice(0, 3)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="cell-thumb"
      />
      <span v-if="supplier.gallery.length > 3" class="cell-more-images">
        +{{ supplier.gallery.length - 3 }} more
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  supplier: {
    type: Object,
    required: false,
    default: () => ({
      business_name: 'Loading...',
      displayName: 'Loading...',
      title: 'Supplier',
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>
