<template>
  <UCard>
    <UAvatar
      :src="chef?.avatarUrl || chef?.profile_image?.url"
      :alt="chef?.chef_name || 'Chef'"
      size="md"
    />
    <div class="info">
      <h4 v-if="chef?.chef_name" class="card-header">{{ chef.chef_name }}</h4>
      <p v-if="chef?.title" class="card-subtitle">{{ chef.title }}</p>
      <p v-if="chef?.specialties?.length" class="tags">
        {{ chef.specialties[0] }}
      </p>
    </div>
  </UCard>
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
