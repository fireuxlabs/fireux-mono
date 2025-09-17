<template>
  <UCard>
    <ProfileHeader :avatar="chef.avatar" :name="chef.name" :title="chef.title" size="md" />

    <p v-if="chef.bioShort" class="profile-bio">{{ chef.bioShort }}</p>

    <UDivider v-if="chef.bioShort && chef.specialties?.length" />
    <div v-if="chef.specialties?.length">
      <ProfileTags :tags="chef.specialties" :limit="3" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefCellProps } from '../../../../../models/profiles/Chef.model'
import ProfileHeader from '../../shared/ProfileHeader.vue'
import ProfileTags from '../../shared/ProfileTags.vue'
defineProps<{ chef: ChefCellProps }>()
</script>
