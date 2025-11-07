<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="props.professional.avatar"
        :alt="props.professional.title || 'Professional'"
        :text="props.professional.initials"
        size="md"
      />
      <div class="profile-info">
        <h4 class="profile-name">
          {{ props.professional.title || 'Professional' }}
        </h4>
        <p v-if="props.professional.subtitle" class="profile-subtitle">
          {{ props.professional.subtitle }}
        </p>
      </div>
    </div>

    <p v-if="props.professional.bio_short" class="profile-bio">
      {{ props.professional.bio_short }}
    </p>

    <div v-if="props.professional.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in props.professional.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="props.professional.specialties.length > 3" class="tag-more">
        +{{ props.professional.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model'

const props = defineProps<{ professional: ProfessionalCard.Cell }>()
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
