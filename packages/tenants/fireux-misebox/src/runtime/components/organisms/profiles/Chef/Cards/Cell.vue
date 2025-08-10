<template>
  <UCard class="profile-cell chef-cell">
    <div class="profile-header">
      <UAvatar
        :src="chef?.avatarUrl"
        :alt="chef?.chef_name || 'Chef'"
        size="md"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.title" class="profile-title">{{ chef.title }}</p>
      </div>
    </div>

    <p v-if="chef?.bio_short" class="profile-bio">
      {{ chef.bio_short }}
    </p>

    <div v-if="chef?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="profile-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 3" class="profile-tag-more">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Chef } from '../../../../../models/profiles/Chef.model'

defineProps<{
  chef?: Partial<Chef>
}>()
</script>
