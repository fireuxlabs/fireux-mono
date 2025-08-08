<template>
  <UCard class="pill-card">
    <div class="pill-content">
      <UAvatar
        :src="chef?.avatarUrl || chef?.profile_image?.url"
        :alt="chef?.chef_name || 'Chef'"
        size="sm"
      />
      <div class="pill-info">
        <h4 v-if="chef?.chef_name" class="pill-name">{{ chef.chef_name }}</h4>
        <p v-if="chef?.specialties?.length" class="pill-subtitle">
          {{ chef.specialties[0] }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  chef?: Partial<Chef>
}>()
</script>
