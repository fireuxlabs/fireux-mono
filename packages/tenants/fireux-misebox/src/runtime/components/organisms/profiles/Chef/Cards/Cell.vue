<template>
  <div class="profile-cell chef-theme">
    <div class="cell-header">
      <img
        :src="
          chef?.avatarUrl || chef?.profile_image?.url || '/default-avatar.png'
        "
        :alt="`${chef?.chef_name || chef?.displayName || 'Chef'} avatar`"
        class="cell-avatar"
      />
      <div class="cell-info">
        <h3 class="cell-name">
          {{
            chef?.chef_name || chef?.displayName || chef?.name || 'Loading...'
          }}
        </h3>
        <p class="cell-subtitle">
          {{ chef?.title || chef?.specialization || 'Chef' }}
        </p>
      </div>
    </div>

    <p v-if="chef?.bio_short" class="cell-bio">{{ chef.bio_short }}</p>

    <div v-if="chef?.specialties?.length" class="cell-tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="cell-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 3" class="cell-more-tags">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>

    <div v-if="chef?.gallery?.length" class="cell-gallery">
      <img
        v-for="(item, index) in chef.gallery.slice(0, 3)"
        :key="index"
        :src="item.image_url"
        :alt="item.name"
        class="cell-thumb"
      />
      <span v-if="chef.gallery.length > 3" class="cell-more-images">
        +{{ chef.gallery.length - 3 }}
      </span>
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
      displayName: 'Loading...',
      title: 'Chef',
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>
