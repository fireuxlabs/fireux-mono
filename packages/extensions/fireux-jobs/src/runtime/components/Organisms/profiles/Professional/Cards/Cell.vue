<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="professional.avatar"
        :alt="professional.display_name"
        size="md"
      />
      <div class="profile-info">
        <h4 class="profile-name">{{ professional.display_name }}</h4>
        <p v-if="professional.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
      </div>
    </div>

    <p v-if="professional.bio_short" class="profile-bio">
      {{ professional.bio_short }}
    </p>

    <div v-if="professional.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in professional.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="professional.specialties.length > 3" class="tag-more">
        +{{ professional.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model'
defineProps<{ professional: ProfessionalCard.Cell }>()
</script>
