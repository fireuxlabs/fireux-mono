<template>
  <div v-if="professional" class="profile-card">
    <!-- Profile Header -->
    <div class="header">
      <div class="avatar-section">
        <UAvatar
          :src="professional.avatarUrl"
          :alt="professional.professional_name || professional.displayName"
          size="2xl"
          :text="
            getInitials(
              professional.professional_name || professional.displayName
            )
          "
          class="avatar"
        />
        <div v-if="professional.verified" class="profile-badge verified">
          <UIcon name="i-heroicons-check-badge" />
          <span>Verified Professional</span>
        </div>
      </div>

      <div class="info-section">
        <h1 class="title">
          {{ professional.professional_name || professional.displayName }}
        </h1>
        <p v-if="professional.title" class="subtitle">
          {{ professional.title }}
        </p>
        <div v-if="professional.email" class="contact">
          <UIcon name="i-heroicons-envelope" />
          {{ professional.email }}
        </div>

        <!-- Location Info -->
        <div v-if="professional.locations?.length" class="location">
          <UIcon name="i-heroicons-map-pin" />
          <span>{{ formatLocation(professional.locations[0]) }}</span>
          <span v-if="professional.locations[0].radius" class="text-muted">
            ({{ professional.locations[0].radius }}km radius)
          </span>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="content">
      <!-- Bio Section -->
      <div
        v-if="professional.bio_short || professional.bio_long"
        class="profile-section"
      >
        <h3 class="profile-section-title">
          <UIcon name="i-heroicons-user" />
          About
        </h3>
        <p class="profile-description">
          {{ professional.bio_long || professional.bio_short }}
        </p>
      </div>

      <!-- Languages Section -->
      <div
        v-if="professional.languages?.length"
        class="profile-content-section"
      >
        <h3 class="profile-content-title">Languages</h3>
        <div class="languages-grid">
          <div
            v-for="language in professional.languages"
            :key="language.language"
            class="language-item"
          >
            <UBadge variant="outline" size="md">
              {{ language.language }} ({{ language.proficiency }})
            </UBadge>
          </div>
        </div>
        <!-- Kitchen Experience Section -->
        <div
          v-if="professional.kitchen_experience?.length"
          class="profile-content-section"
        >
          <h3 class="profile-content-title">Kitchen Experience</h3>
          <div class="experience-timeline">
            <div
              v-for="experience in professional.kitchen_experience"
              :key="experience.name"
              class="experience-item"
            >
              <div class="experience-header">
                <img
                  v-if="experience.image_url"
                  :src="experience.image_url"
                  :alt="experience.name"
                  class="experience-logo"
                />
                <div class="experience-info">
                  <h4 class="experience-role">{{ experience.role }}</h4>
                  <p class="experience-company">{{ experience.name }}</p>
                  <p class="experience-location">
                    {{
                      experience.short_address || experience.formatted_address
                    }}
                  </p>
                  <p class="experience-duration">
                    {{
                      formatDuration(
                        experience.from_month,
                        experience.from_year,
                        experience.to_month,
                        experience.to_year,
                        experience.ongoing
                      )
                    }}
                  </p>
                </div>
              </div>
              <p class="experience-description">
                {{ experience.responsibilities }}
              </p>
            </div>
          </div>
        </div>

        <!-- Education Section -->
        <div
          v-if="professional.education?.length"
          class="profile-content-section"
        >
          <h3 class="profile-content-title">Education</h3>
          <div class="education-grid">
            <div
              v-for="edu in professional.education"
              :key="edu.institution"
              class="education-item"
            >
              <div class="education-header">
                <img
                  v-if="edu.image_url"
                  :src="edu.image_url"
                  :alt="edu.institution"
                  class="education-logo"
                />
                <div>
                  <h4 class="education-degree">{{ edu.degree }}</h4>
                  <p class="education-institution">{{ edu.institution }}</p>
                  <p class="education-duration">
                    {{ edu.start_year }} -
                    {{ edu.ongoing ? 'Present' : edu.end_year }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Certifications Section -->
        <div
          v-if="professional.certifications?.length"
          class="profile-content-section"
        >
          <h3 class="profile-content-title">Certifications</h3>
          <div class="certifications-grid">
            <div
              v-for="cert in professional.certifications"
              :key="cert.name"
              class="certification-item"
            >
              <img
                v-if="cert.image_url"
                :src="cert.image_url"
                :alt="cert.place_name"
                class="certification-logo"
              />
              <div>
                <h4 class="certification-name">{{ cert.name }}</h4>
                <p class="certification-issuer">{{ cert.place_name }}</p>
                <p class="certification-year">{{ cert.year }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects Section -->
        <div
          v-if="professional.projects?.length"
          class="profile-content-section"
        >
          <h3 class="profile-content-title">Projects</h3>
          <div class="projects-grid">
            <div
              v-for="project in professional.projects"
              :key="project.name"
              class="project-item"
            >
              <h4 class="project-name">{{ project.name }}</h4>
              <p class="project-role">{{ project.role }}</p>
              <p class="project-duration">
                {{ project.from_year }} -
                {{ project.ongoing ? 'Present' : project.to_year }}
              </p>
              <p class="project-description">{{ project.responsibilities }}</p>
            </div>
          </div>
        </div>

        <!-- Other Employment Section -->
        <div
          v-if="professional.other_employment_experience?.length"
          class="profile-content-section"
        >
          <h3 class="profile-content-title">Other Experience</h3>
          <div class="other-employment-grid">
            <div
              v-for="job in professional.other_employment_experience"
              :key="job.name"
              class="employment-item"
            >
              <div class="employment-header">
                <img
                  v-if="job.image_url"
                  :src="job.image_url"
                  :alt="job.name"
                  class="employment-logo"
                />
                <div>
                  <h4 class="employment-role">{{ job.role }}</h4>
                  <p class="employment-company">{{ job.name }}</p>
                  <p class="employment-duration">
                    {{
                      formatDuration(
                        job.from_month,
                        job.from_year,
                        job.to_month,
                        job.to_year,
                        job.ongoing
                      )
                    }}
                  </p>
                </div>
              </div>
              <p class="employment-description">{{ job.responsibilities }}</p>
            </div>
          </div>
        </div>

        <!-- Volunteering Section -->
        <div
          v-if="professional.volunteering?.length"
          class="profile-content-section"
        >
          <h3 class="profile-content-title">Volunteer Work</h3>
          <div class="volunteering-grid">
            <div
              v-for="volunteer in professional.volunteering"
              :key="volunteer.organization"
              class="volunteer-item"
            >
              <h4 class="volunteer-role">{{ volunteer.role }}</h4>
              <p class="volunteer-organization">{{ volunteer.organization }}</p>
              <p class="volunteer-duration">
                {{ volunteer.from_year }} -
                {{ volunteer.ongoing ? 'Present' : volunteer.to_year }}
              </p>
              <p class="volunteer-description">
                {{ volunteer.responsibilities }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../models/profiles/Professional.model'

defineProps<{
  professional?: Partial<Professional>
}>()

// Helper functions for template use only - no complex logic
function getInitials(name?: string) {
  if (!name) return 'P'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatLocation(location?: any) {
  if (!location?.locations?.length) return ''
  return location.locations[0].formatted_address
}

function formatDuration(fromMonth?: string, fromYear?: string, toMonth?: string, toYear?: string, ongoing?: boolean) {
  const start = fromMonth && fromYear ? `${fromMonth} ${fromYear}` : fromYear
  let end = 'Present'
  if (!ongoing) {
    end = toMonth && toYear ? `${toMonth} ${toYear}` : toYear
  }
  return `${start} - ${end}`
}
</script>


