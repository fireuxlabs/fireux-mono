<template>
  <div class="profile-pill chef-theme">
    <img
      :src="
        chef?.avatarUrl || chef?.profile_image?.url || '/default-avatar.png'
      "
      :alt="`${chef?.chef_name || 'Chef'} avatar`"
      class="pill-avatar"
    />
    <div class="pill-info">
      <h4 class="pill-name">{{ chef?.chef_name || 'Loading...' }}</h4>
      <p v-if="chef?.title" class="pill-subtitle">{{ chef.title }}</p>
      <p v-else-if="chef?.specialties?.length" class="pill-subtitle">
        {{ chef.specialties[0] }}
      </p>
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
      specialties: [],
      avatarUrl: '/default-avatar.png',
    }),
  },
})
</script>
