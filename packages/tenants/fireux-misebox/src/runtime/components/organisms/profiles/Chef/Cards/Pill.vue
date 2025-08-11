<template>
  <UCard class="profile-card profile-pill chef-pill">
    <div class="profile-header">
      <UAvatar
        :src="chef?.avatarUrl"
        :alt="chef?.chef_name || 'Chef'"
        size="sm"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.specialties?.length" class="profile-title">
          {{ chef.specialties[0] }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Chef } from '../../../../../models/profiles/Chef.model'

defineProps<{
  chef?: Partial<Chef>
}>()
</script>
