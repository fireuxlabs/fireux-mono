<template>
  <div class="profile-cell employer-theme">
    <div class="cell-header">
      <img
        :src="
          employer?.avatarUrl ||
          employer?.profile_image?.url ||
          '/default-avatar.png'
        "
        :alt="`${employer?.company_name || employer?.displayName || 'Employer'} avatar`"
        class="cell-avatar"
      />
      <div class="cell-info">
        <h3 class="cell-name">
          {{
            employer?.company_name ||
            employer?.displayName ||
            employer?.name ||
            'Loading...'
          }}
        </h3>
        <p class="cell-subtitle">
          {{ employer?.title || employer?.business_type || 'Employer' }}
        </p>
      </div>
    </div>

    <p v-if="employer?.bio_short" class="cell-bio">
      {{ employer.bio_short }}
    </p>

    <div v-if="employer?.specialties?.length" class="cell-tags">
      <span
        v-for="specialty in employer.specialties.slice(0, 3)"
        :key="specialty"
        class="cell-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="employer.specialties.length > 3" class="cell-more-tags">
        +{{ employer.specialties.length - 3 }} more
      </span>
    </div>

    <div v-if="employer?.gallery?.length" class="cell-gallery">
      <img
        v-for="(item, index) in employer.gallery.slice(0, 3)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="cell-thumb"
      />
      <span v-if="employer.gallery.length > 3" class="cell-more-images">
        +{{ employer.gallery.length - 3 }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  employer: {
    type: Object,
    required: false,
    default: () => ({
      company_name: 'Loading...',
      displayName: 'Loading...',
      title: 'Employer',
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>
