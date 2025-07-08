<template>
  <UCard>
    <div class="professional-profile-header">
      <UAvatar
        :src="professional?.avatarUrl"
        :alt="professionalName"
        size="xl"
        :text="getInitials(professionalName)"
      />
      <div class="professional-info">
        <h2 class="professional-name">{{ professionalName }}</h2>
        <p v-if="professional?.email" class="professional-email">
          {{ professional.email }}
        </p>
        <p v-if="professional?.title" class="professional-title">
          {{ professional.title }}
        </p>
      </div>
    </div>

    <div
      v-if="professional?.bio_short || professional?.bio_long"
      class="professional-about"
    >
      <h3 class="section-title">About</h3>
      <p class="section-content">
        {{ professional.bio_long || professional.bio_short }}
      </p>
    </div>

    <div v-if="hasSkills" class="professional-skills">
      <h3 class="section-title">Skills</h3>
      <div class="skills-grid">
        <UBadge
          v-for="skill in professional.skills"
          :key="skill"
          variant="soft"
        >
          {{ skill }}
        </UBadge>
      </div>
    </div>

    <div v-if="hasExperience" class="professional-experience">
      <h3 class="section-title">Experience</h3>
      <p class="section-content">
        {{ professional.kitchen_experience.length }} position(s)
      </p>
    </div>

    <div v-if="hasCertifications" class="professional-certifications">
      <h3 class="section-title">Certifications</h3>
      <p class="section-content">
        {{ professional.certifications.length }} certification(s)
      </p>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  professional: {
    type: Object,
    default: null,
  },
})

// Computed property for professional display name
const professionalName = computed(() => {
  if (!props.professional) return 'Professional'
  return (
    props.professional.full_name ||
    props.professional.name ||
    props.professional.displayName ||
    'Professional'
  )
})

// Computed properties for data presence
const hasSkills = computed(() => {
  return props.professional?.skills && props.professional.skills.length > 0
})

const hasExperience = computed(() => {
  return (
    props.professional?.kitchen_experience &&
    props.professional.kitchen_experience.length > 0
  )
})

const hasCertifications = computed(() => {
  return (
    props.professional?.certifications &&
    props.professional.certifications.length > 0
  )
})

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return 'P'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.professional-profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.professional-info {
  flex: 1;
  min-width: 0;
}

.professional-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0;
}

.professional-email {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: var(--space-1) 0 0 0;
}

.professional-title {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  font-weight: 500;
  margin: var(--space-1) 0 0 0;
}

.professional-about,
.professional-skills,
.professional-experience,
.professional-certifications {
  margin-bottom: var(--space-4);
}

.professional-certifications {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ui-text);
  margin: 0 0 var(--space-2) 0;
}

.section-content {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: 0;
  line-height: 1.5;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
