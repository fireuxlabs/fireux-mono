<template>
  <UCard class="profile-card profile-variant">
    <div class="profile-header">
      <UAvatar
        :src="professional?.avatarUrl || professional?.profile_image?.url"
        :alt="professional?.professional_name || 'Professional'"
        size="lg"
        class="profile-avatar-large"
      />
      <h3 v-if="professional?.professional_name" class="profile-title">
        {{ professional.professional_name }}
      </h3>
      <p v-if="professional?.title" class="profile-subtitle-main">
        {{ professional.title }}
      </p>
      <div v-if="professional?.locations?.[0]" class="profile-location">
        📍 {{ professional.locations[0].short_address || professional.locations[0].formatted_address }}
      </div>
    </div>

    <div class="profile-body">
      <p v-if="professional?.bio_short" class="profile-description-main">
        {{ professional.bio_short }}
      </p>

      <div class="profile-highlights" v-if="professional?.kitchen_experience?.length || professional?.certifications?.length">
        <div v-if="professional?.kitchen_experience?.length" class="profile-highlight">
          <span class="highlight-value">{{ professional.kitchen_experience.length }}</span>
          <span class="highlight-label">Kitchen Roles</span>
        </div>
        <div v-if="professional?.certifications?.length" class="profile-highlight">
          <span class="highlight-value">{{ professional.certifications.length }}</span>
          <span class="highlight-label">Certifications</span>
        </div>
        <div v-if="professional?.education?.length" class="profile-highlight">
          <span class="highlight-value">{{ professional.education.length }}</span>
          <span class="highlight-label">Education</span>
        </div>
        <div v-if="professional?.languages?.length" class="profile-highlight">
          <span class="highlight-value">{{ professional.languages.length }}</span>
          <span class="highlight-label">Languages</span>
        </div>
      </div>

      <div class="profile-tags-main" v-if="professional?.cuisine_types?.length">
        <span 
          v-for="cuisine in professional?.cuisine_types?.slice(0, 4)" 
          :key="cuisine"
          class="profile-tag-main featured"
        >
          {{ cuisine }}
        </span>
      </div>
    </div>

    <div class="profile-footer">
      <div class="profile-badges-main">
        <span v-if="professional?.kitchen_experience?.[0]" class="profile-badge-main">
          🍳 {{ professional.kitchen_experience[0].role }}
        </span>
        <span v-if="professional?.kitchen_experience?.[0]?.ongoing" class="profile-badge-main available">
          🟢 Currently at {{ professional.kitchen_experience[0].name }}
        </span>
      </div>
      
      <div class="profile-contact">
        <button class="profile-action-btn">View</button>
        <button class="profile-action-btn primary">Contact</button>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  professional?: Partial<Professional>
}>()
</script>
