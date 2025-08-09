<template>
  <div class="professional-profile">
    <div class="profile-header">
      <div class="professional-avatar">
        <img
          :src="professional?.avatarUrl || '/default-avatar.png'"
          :alt="professional?.displayName || 'Professional'"
          class="avatar-image"
        />
        <div
          class="status-indicator"
          :class="professional.verified ? 'verified' : 'unverified'"
        >
          <UIcon
            :name="
              professional.verified
                ? 'i-lucide-check-circle'
                : 'i-lucide-circle'
            "
          />
        </div>
      </div>

      <div class="professional-info">
        <h2 class="professional-name">{{ professional.displayName }}</h2>
        <p class="professional-title">{{ professional.title }}</p>

        <div class="professional-meta">
          <div class="meta-item" v-if="professional.locations?.length">
            <UIcon name="i-lucide-map-pin" class="meta-icon" />
            <span>{{ getLocationText(professional.locations[0]) }}</span>
          </div>

          <div class="meta-item" v-if="professional.email">
            <UIcon name="i-lucide-mail" class="meta-icon" />
            <span>{{ professional.email }}</span>
          </div>

          <div class="meta-item" v-if="getExperienceYears() > 0">
            <UIcon name="i-lucide-briefcase" class="meta-icon" />
            <span>{{ getExperienceYears() }}+ years experience</span>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <UButton size="lg" class="contact-btn">
          <UIcon name="i-lucide-message-circle" />
          Contact
        </UButton>
        <UButton variant="outline" size="lg">
          <UIcon name="i-lucide-share-2" />
          Share
        </UButton>
      </div>
    </div>

    <div class="profile-content">
      <div
        class="bio-section"
        v-if="professional.bio_long || professional.bio_short"
      >
        <h3>About</h3>
        <p class="bio-text">
          {{ professional.bio_long || professional.bio_short }}
        </p>
      </div>

      <div
        class="experience-section"
        v-if="professional.kitchen_experience?.length"
      >
        <h3>Kitchen Experience</h3>
        <div class="experience-list">
          <div
            v-for="exp in professional.kitchen_experience.slice(0, 3)"
            :key="exp.name + exp.from_year"
            class="experience-item"
          >
            <div class="exp-header">
              <div class="exp-company">
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
            </div>
            <p class="exp-description" v-if="exp.responsibilities">
              {{ exp.responsibilities }}
            </p>
          </div>

          <UButton
            v-if="professional.kitchen_experience.length > 3"
            variant="ghost"
            class="view-more-btn"
          >
            View {{ professional.kitchen_experience.length - 3 }} more positions
          </UButton>
        </div>
      </div>

      <div
        class="skills-section"
        v-if="
          professional.cuisine_types?.length || professional.languages?.length
        "
      >
        <h3>Skills & Languages</h3>

        <div class="skills-grid">
          <div v-if="professional.cuisine_types?.length" class="skill-group">
            <h4>Cuisine Types</h4>
            <div class="skill-tags">
              <span
                v-for="cuisine in professional.cuisine_types"
                :key="cuisine"
                class="skill-tag"
              >
                {{ cuisine }}
              </span>
            </div>
          </div>

          <div v-if="professional.languages?.length" class="skill-group">
            <h4>Languages</h4>
            <div class="skill-tags">
              <span
                v-for="lang in professional.languages"
                :key="lang.language"
                class="skill-tag"
              >
                {{ lang.language }} ({{ lang.proficiency }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  professional: {
    type: Object,
    required: false, // ✅ FIXED: Change to false to handle undefined gracefully
    default: () => null,
  },
})

const getLocationText = (location) => {
  if (location.locations?.[0]?.formatted_address) {
    return location.locations[0].formatted_address.split(',')[0]
  }
  return 'Location not specified'
}

const getExperienceYears = () => {
  if (!props.professional.kitchen_experience?.length) return 0

  const experiences = props.professional.kitchen_experience
  const startYear = Math.min(
    ...experiences.map((exp) =>
      parseInt(exp.from_year || new Date().getFullYear())
    )
  )
  const currentYear = new Date().getFullYear()

  return currentYear - startYear
}

const formatDateRange = (fromMonth, fromYear, toMonth, toYear, ongoing) => {
  const start = `${fromMonth || ''} ${fromYear || ''}`.trim()

  if (ongoing) {
    return `${start} - Present`
  }

  const end = `${toMonth || ''} ${toYear || ''}`.trim()
  return `${start} - ${end}`
}
</script>

<style scoped>
.professional-profile {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.professional-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-indicator.verified {
  color: #10b981;
}

.status-indicator.unverified {
  color: #6b7280;
}

.professional-info {
  flex: 1;
  min-width: 0;
}

.professional-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.professional-title {
  font-size: 1.25rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.professional-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
}

.contact-btn {
  background: var(--professional-primary, #3b82f6);
  color: white;
}

.profile-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.bio-section h3,
.experience-section h3,
.skills-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.bio-text {
  font-size: 1rem;
  color: #4b5563;
  line-height: 1.6;
  white-space: pre-wrap;
}

.experience-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.experience-item {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.exp-header {
  margin-bottom: 1rem;
}

.exp-company {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.exp-details {
  flex: 1;
}

.exp-role {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.exp-name {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.exp-period {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.exp-description {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.view-more-btn {
  align-self: flex-start;
}

.skills-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.skill-group h4 {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: #eff6ff;
  color: var(--professional-primary, #3b82f6);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    text-align: center;
  }

  .professional-info {
    text-align: center;
  }

  .professional-meta {
    align-items: center;
  }

  .profile-actions {
    flex-direction: row;
    justify-content: center;
  }

  .avatar-image {
    width: 100px;
    height: 100px;
  }

  .professional-name {
    font-size: 1.5rem;
  }

  .profile-content {
    padding: 1.5rem;
  }

  .exp-company {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .company-logo {
    align-self: center;
  }
}
</style>
