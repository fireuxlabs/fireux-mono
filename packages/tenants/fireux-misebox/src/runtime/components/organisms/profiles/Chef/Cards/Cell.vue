<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar :src="chef.avatar" :alt="chef.name" size="md" />
      <div class="profile-info">
        <h4 class="profile-name">{{ chef.name }}</h4>
        <p v-if="chef.title" class="profile-subtitle">{{ chef.title }}</p>
      </div>
    </div>

    <p v-if="chef.bioShort" class="profile-bio">
      {{ chef.bioShort }}
    </p>

    <div v-if="chef.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in chef.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="chef.specialties.length > 3" class="tag-more">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefCellProps } from '../../../../../models/profiles/Chef.model'
defineProps<{ chef: ChefCellProps }>()
</script>
