<template>
  <UCard class="profiles cards profile professional-theme">
    <div class="header">
      <div class="avatar-section">
        <UAvatar
          :src="professional?.avatarUrl || professional?.profile_image?.url"
          :alt="professional?.professional_name || 'Professional'"
          size="xl"
        />
        <div v-if="professional?.verified" class="verification-badge">
          <UIcon name="i-lucide-check-circle" />
          <span>Verified</span>
        </div>
      </div>
      <div class="info">
        <h2 v-if="professional?.professional_name" class="title">
          {{ professional.professional_name }}
        </h2>
        <p v-if="professional?.title" class="subtitle">
          {{ professional.title }}
        </p>
        <div class="meta-stats">
          <div v-if="professional?.locations?.length" class="stat">
            <UIcon name="i-lucide-map-pin" />
            <span>{{ getLocationText(professional.locations[0]) }}</span>
          </div>
          <div v-if="professional?.email" class="stat">
            <UIcon name="i-lucide-mail" />
            <span>{{ professional.email }}</span>
          </div>
          <div v-if="getExperienceYears() > 0" class="stat">
            <UIcon name="i-lucide-briefcase" />
            <span>{{ getExperienceYears() }}+ years experience</span>
          </div>
        </div>
      </div>
      <div class="actions">
        <UButton size="lg" color="primary">
          <UIcon name="i-lucide-message-circle" />
          Contact
        </UButton>
        <UButton variant="outline" size="lg">
          <UIcon name="i-lucide-share-2" />
          Share
        </UButton>
      </div>
    </div>

    <div
      v-if="professional?.bio_long || professional?.bio_short"
      class="description"
    >
      {{ professional.bio_long || professional.bio_short }}
    </div>

    <div v-if="professional?.cuisine_types?.length" class="tags">
      <span
        v-for="cuisine in professional.cuisine_types"
        :key="cuisine"
        class="tag"
      >
        {{ cuisine }}
      </span>
    </div>

    <div
      v-if="professional?.kitchen_experience?.length"
      class="experience-section"
    >
      <h3>Recent Experience</h3>
      <div
        v-for="exp in professional.kitchen_experience.slice(0, 2)"
        :key="exp.name + exp.from_year"
        class="experience-item"
      >
        <div class="exp-header">
          <img
            v-if="exp.image_url"
            :src="exp.image_url"
            :alt="exp.name"
            class="company-logo"
          />
          <div class="exp-details">
            <h4 class="exp-role">{{ exp.role }}</h4>
            <p class="exp-name">{{ exp.name }}</p>
            <p class="exp-period">
              {{
                formatDateRange(
                  exp.from_month,
                  exp.from_year,
                  exp.to_month,
                  exp.to_year,
                  exp.ongoing
                )
              }}
            </p>
          </div>
        </div>
        <p v-if="exp.responsibilities" class="exp-description">
          {{ exp.responsibilities }}
        </p>
      </div>
    </div>

    <div v-if="professional?.languages?.length" class="stats">
      <div class="stat">
        <UIcon name="i-lucide-globe" />
        <span>{{ professional.languages.length }} languages</span>
      </div>
      <div v-if="professional?.education?.length" class="stat">
        <UIcon name="i-lucide-graduation-cap" />
        <span>{{ professional.education.length }} qualifications</span>
      </div>
      <div v-if="professional?.certifications?.length" class="stat">
        <UIcon name="i-lucide-shield-check" />
        <span>{{ professional.certifications.length }} certifications</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Professional } from '../../../../../models/profiles/Professional.model'
type ProfessionalView = Professional & {
  verified?: boolean
  profile_image?: { url?: string }
  cuisine_types?: string[]
}
const props = defineProps<{ professional?: Partial<ProfessionalView> }>()

const getLocationText = (location: any) => {
  if (location?.locations?.[0]?.formatted_address) {
    return location.locations[0].formatted_address.split(',')[0]
  }
  return 'Location not specified'
}

const getExperienceYears = () => {
  if (!props.professional?.kitchen_experience?.length) return 0

  const experiences = props.professional.kitchen_experience
  const startYear = Math.min(
    ...experiences.map((exp) =>
      parseInt((exp.from_year || String(new Date().getFullYear())) as string)
    )
  )
  const currentYear = new Date().getFullYear()

  return currentYear - startYear
}

const formatDateRange = (
  fromMonth?: string | null,
  fromYear?: string | null,
  toMonth?: string | null,
  toYear?: string | null,
  ongoing?: boolean
) => {
  const start = `${fromMonth || ''} ${fromYear || ''}`.trim()

  if (ongoing) {
    return `${start} - Present`
  }

  const end = `${toMonth || ''} ${toYear || ''}`.trim()
  return `${start} - ${end}`
}
</script>
