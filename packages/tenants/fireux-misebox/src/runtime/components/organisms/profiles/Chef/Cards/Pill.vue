<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar :src="chef.avatar" :alt="chef.name" size="sm" />
      <div class="profile-info">
        <h4 class="profile-name">{{ chef.name }}</h4>
        <p v-if="chef.title" class="profile-title">{{ chef.title }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefPillProps } from '../../../../../models/profiles/Chef.model'

defineProps<{ chef: ChefPillProps }>()
</script>
