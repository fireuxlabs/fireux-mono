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

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-name {
  font-weight: 600;
  line-height: 1.2;
}

.profile-subtitle {
  font-size: 0.9rem;
  color: rgba(17, 24, 39, 0.7);
}

.profile-bio {
  font-size: 0.95rem;
  color: rgba(17, 24, 39, 0.8);
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: rgba(17, 24, 39, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.tag-more {
  font-size: 0.75rem;
  color: rgba(17, 24, 39, 0.6);
}

</style>
