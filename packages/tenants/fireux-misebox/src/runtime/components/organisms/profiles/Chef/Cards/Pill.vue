<template>
  <div class="cell card-pill chef-theme">
    <img
      :src="chef.avatarUrl || chef.profile_image?.url || '/default-avatar.png'"
      :alt="`${chef.chef_name} avatar`"
      class="avatar"
    />
    <div class="info">
      <h4 class="name">{{ chef.chef_name }}</h4>
      <p v-if="chef.title" class="subtitle">{{ chef.title }}</p>
      <p v-else-if="chef.specialties?.length" class="subtitle">
        {{ chef.specialties[0] }}
      </p>
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
