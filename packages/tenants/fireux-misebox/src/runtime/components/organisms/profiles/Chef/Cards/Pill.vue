<template>
  <UCard>
    <ProfileHeader :avatar="chef.avatar" :name="chef.name" :title="chef.title" size="sm" />
  </UCard>
  
</template>

<script setup lang="ts">
import type { ChefPillProps } from '../../../../../models/profiles/Chef.model'
import ProfileHeader from '../../shared/ProfileHeader.vue'

defineProps<{ chef: ChefPillProps }>()
</script>
