<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="professional?.avatarUrl || professional?.profile_image?.url"
        :alt="professional?.name || 'Professional'"
        size="md"
      />
      <div class="profile-info">
        <h4 v-if="professional?.name" class="profile-name">
          {{ professional.name }}
        </h4>
        <p
          v-if="professional?.title || professional?.primary_skill"
          class="profile-subtitle"
        >
          {{ professional.title || professional.primary_skill }}
        </p>
      </div>
    </div>

    <p v-if="professional?.bio_short" class="profile-bio">
      {{ professional.bio_short }}
    </p>

    <div v-if="professional?.cuisine_types?.length" class="profile-tags">
      <span
        v-for="cuisine in professional.cuisine_types.slice(0, 3)"
        :key="cuisine"
        class="tag"
      >
        {{ cuisine }}
      </span>
      <span v-if="professional.cuisine_types.length > 3" class="tag-more">
        +{{ professional.cuisine_types.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../../models/profiles/Professional.model'

defineProps<{
  professional?: Partial<Professional>
}>()
</script>
