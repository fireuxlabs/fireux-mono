<template>
  <UCard class="cell-card">
    <div class="cell-header">
      <UAvatar
        :src="professional?.avatarUrl || professional?.profile_image?.url"
        :alt="professional?.professional_name || 'Professional'"
        size="md"
      />
      <div class="cell-info">
        <h4 v-if="professional?.professional_name" class="cell-title">
          {{ professional.professional_name }}
        </h4>
        <p v-if="professional?.title" class="cell-subtitle">
          {{ professional.title }}
        </p>
      </div>
    </div>

    <div class="cell-content">
      <p v-if="professional?.bio_short" class="cell-description">
        {{ professional.bio_short }}
      </p>

      <div class="cell-tags" v-if="professional?.cuisine_types?.length">
        <span
          v-for="cuisine in professional?.cuisine_types?.slice(0, 3)"
          :key="cuisine"
          class="cell-tag cuisine"
        >
          {{ cuisine }}
        </span>
      </div>

      <div
        class="cell-stats"
        v-if="
          professional?.kitchen_experience?.length ||
          professional?.certifications?.length
        "
      >
        <span v-if="professional?.kitchen_experience?.length" class="cell-stat">
          🍳 {{ professional.kitchen_experience.length }} kitchen roles
        </span>
        <span v-if="professional?.certifications?.length" class="cell-stat">
          🏆 {{ professional.certifications.length }} certifications
        </span>
      </div>

      <div v-if="professional?.kitchen_experience?.[0]" class="cell-latest">
        <span class="latest-label">Latest:</span>
        <span class="latest-role">
          {{ professional.kitchen_experience[0].role }} at
          {{ professional.kitchen_experience[0].name }}
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  professional?: Partial<Professional>
}>()
</script>
