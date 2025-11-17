<template>
  <UCard
    v-if="view"
    :class="[
      ui.surface.base,
      ui.surface.padding.spacious,
      'max-w-3xl',
      'space-y-10',
    ]"
  >
    <template>
      <UPageCard
        v-if="view"

    <script setup lang="ts">
    import ProfileEducationSection from './Profile/EducationSection.vue'
    import ProfileCertificationSection from './Profile/CertificationSection.vue'
    import ProfileProjectSection from './Profile/ProjectSection.vue'
    import ProfileVolunteerSection from './Profile/VolunteerSection.vue'
    import { profileUi } from '../shared/profileUi'
            ui.surface.base,
            ui.surface.padding.spacious,
            ui.layout.hero,
          ]"
        >
          <UAvatar
            :src="view.avatar"
            :alt="view.name"
            size="xl"
            class="self-start shadow-sm"
            :text="view.initials"
          />

          <div :class="[ui.layout.infoStack, 'gap-3']">
            <div class="space-y-2">
              <h1 :class="ui.text.nameXl">{{ view.name }}</h1>

              <div
                v-if="view.verified"
                class="inline-flex items-center gap-1 text-sm font-medium text-primary-600"
              >
                <UIcon name="i-heroicons-check-badge" class="h-5 w-5" />
                <span>Verified Professional</span>
              </div>

              <p v-if="view.subtitle" class="text-base text-gray-600">
                {{ view.subtitle }}
              </p>

              <div v-if="view.location" :class="ui.layout.metaRow">
                <UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-gray-400" />
                <span>{{ view.location }}</span>
              </div>
            </div>

            <div v-if="view.badges.length" :class="[ui.chip.group, 'pt-1']">
              <UBadge
                v-for="badge in view.badges"
                :key="badge"
                size="sm"
                variant="soft"
              >
                {{ badge }}
              </UBadge>
            </div>

            <dl
              v-if="view.experienceCount || view.otherCount || view.educationCount"
              class="grid gap-4 pt-4 text-sm text-gray-500 sm:grid-cols-3"
            >
              <div v-if="view.experienceCount" class="space-y-1">
                <dt :class="ui.text.labelSm">Relevant Experience</dt>
                <dd :class="ui.text.nameMd">{{ view.experienceCount }}</dd>
              </div>
              <div v-if="view.otherCount" class="space-y-1">
                <dt :class="ui.text.labelSm">Other Experience</dt>
                <dd :class="ui.text.nameMd">{{ view.otherCount }}</dd>
              </div>
              <div v-if="view.educationCount" class="space-y-1">
                <dt :class="ui.text.labelSm">Education</dt>
                <dd :class="ui.text.nameMd">{{ view.educationCount }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div
          v-if="view.bio || view.languages.length"
          :class="[ui.surface.base, ui.surface.padding.comfy, 'space-y-6']"
        >
          <div v-if="view.bio" class="space-y-2">
            <h2 :class="ui.text.nameMd">About</h2>
            <p :class="ui.text.body">{{ view.bio }}</p>
          </div>

          <div v-if="view.languages.length" class="space-y-3">
            <h2 :class="ui.text.nameMd">Languages</h2>
            <div :class="ui.chip.group">
              <UBadge
                v-for="language in view.languages"
                :key="language.label"
                variant="outline"
                size="sm"
              >
                {{ language.label }}
              </UBadge>
            </div>
          </div>
        </div>

        <div
          v-if="view.relevantExperience.length || view.otherExperience.length"
          :class="[ui.surface.base, ui.surface.padding.comfy, 'space-y-6']"
        >
          <ProfileExperienceSection
            v-if="view.relevantExperience.length"
            title="Relevant Experience"
            :items="view.relevantExperience"
          />

          <ProfileExperienceSection
            v-if="view.otherExperience.length"
            title="Other Experience"
            :items="view.otherExperience"
          />
        </div>

        <div
          v-if="view.education.length || view.certifications.length"
          :class="[ui.surface.base, ui.surface.padding.comfy, 'space-y-6']"
        >
          <ProfileEducationSection
            v-if="view.education.length"
            :items="view.education"
          />

          <ProfileCertificationSection
            v-if="view.certifications.length"
            :items="view.certifications"
          />
        </div>

        <div
          v-if="view.projects.length || view.volunteering.length"
          :class="[ui.surface.base, ui.surface.padding.comfy, 'space-y-6']"
        >
          <ProfileProjectSection
            v-if="view.projects.length"
            :items="view.projects"
          />

          <ProfileVolunteerSection
            v-if="view.volunteering.length"
            :items="view.volunteering"
          />
        </div>
      </UPageCard>

      <UPageCard
        v-else
        variant="subtle"
        class="w-full max-w-2xl"
        :ui="{ container: 'flex flex-col items-center gap-3 py-16 text-sm text-gray-500' }"
      >
        <UIcon name="i-lucide-user-round" class="h-10 w-10 text-gray-300" />
        <h2 class="text-base font-semibold text-gray-700">
          No professional profile found
        </h2>
        <p>This profile may have been removed or is not available.</p>
      </UPageCard>
    </template>
import ProfileEducationSection from './Profile/EducationSection.vue'
import ProfileCertificationSection from './Profile/CertificationSection.vue'
import ProfileProjectSection from './Profile/ProjectSection.vue'
import ProfileVolunteerSection from './Profile/VolunteerSection.vue'
import { profileUi } from '../shared/profileUi'

const ui = profileUi

interface ProfessionalLanguage {
  language: string
  proficiency?: string
}

const sanitizeString = (input?: string | number | null) => {
  if (input === null || input === undefined) return null
  return String(input).trim() || null
}

const props = defineProps<{
  professional?: any
}>()

type DurationInput = {
  fromMonth?: string | null
  fromYear?: string | null
  toMonth?: string | null
  toYear?: string | null
  ongoing?: boolean
}

const formatDuration = ({
  fromMonth,
  fromYear,
  toMonth,
  toYear,
  ongoing,
}: DurationInput) => {
  const startMonth = sanitizeString(fromMonth)
  const startYear = sanitizeString(fromYear)
  const endMonth = sanitizeString(toMonth)
  const endYear = sanitizeString(toYear)

  const start =
    startMonth && startYear ? `${startMonth} ${startYear}` : startYear
  if (!ongoing) {
    const end = endMonth && endYear ? `${endMonth} ${endYear}` : endYear
    if (start || end) return [start, end].filter(Boolean).join(' – ')
    return null
  }

  if (start) return `${start} – Present`
  return ongoing ? 'Present' : null
}

const view = computed(() => {
  const model = props.professional || {}
  if (!model || Object.keys(model).length === 0) return null

  const displayName =
    model.display_name || model.professional_name || model.name || null

  const resolveExperience = (entries: any[] | undefined | null) => {
    if (!Array.isArray(entries)) return []
    return entries
      .map((item) => ({
        id: [item.place_id, item.role, item.name].filter(Boolean).join('|'),
        role: sanitizeString(item.role),
        name: sanitizeString(item.name),
        location:
          sanitizeString(item.short_address) ??
          sanitizeString(item.formatted_address) ??
          null,
        description: sanitizeString(item.responsibilities),
        ongoing: item.ongoing === true,
        duration: formatDuration({
          fromMonth: item.from_month,
          fromYear: item.from_year,
          toMonth: item.to_month,
          toYear: item.to_year,
          ongoing: item.ongoing === true,
        }),
        logo: sanitizeString(item.image_url),
      }))
      .filter((entry) => entry.role || entry.name)
  }

  const resolveEducation = (entries: any[] | undefined | null) => {
    if (!Array.isArray(entries)) return []
    return entries
      .map((item) => ({
        id: [item.institution, item.degree].filter(Boolean).join('|'),
        degree: sanitizeString(item.degree),
        institution: sanitizeString(item.institution),
        duration: formatDuration({
          fromYear: item.start_year,
          toYear: item.end_year,
          ongoing: item.ongoing === true,
        }),
        logo: sanitizeString(item.image_url),
      }))
      .filter((entry) => entry.degree || entry.institution)
  }

  const resolveCertifications = (entries: any[] | undefined | null) => {
    if (!Array.isArray(entries)) return []
    return entries
      .map((item) => ({
        id: [item.name, item.place_name].filter(Boolean).join('|'),
        name: sanitizeString(item.name),
        issuer: sanitizeString(item.place_name),
        year: sanitizeString(item.year),
        logo: sanitizeString(item.image_url),
      }))
      .filter((entry) => entry.name || entry.issuer)
  }

  const resolveProjects = (entries: any[] | undefined | null) => {
    if (!Array.isArray(entries)) return []
    return entries
      .map((item) => ({
        id: [item.name, item.role].filter(Boolean).join('|'),
        name: sanitizeString(item.name),
        role: sanitizeString(item.role),
        description: sanitizeString(item.responsibilities),
        duration: formatDuration({
          fromYear: item.from_year,
          toYear: item.to_year,
          ongoing: item.ongoing === true,
        }),
      }))
      .filter((entry) => entry.name || entry.role)
  }

  const resolveVolunteering = (entries: any[] | undefined | null) => {
    if (!Array.isArray(entries)) return []
    return entries
      .map((item) => ({
        id: [item.organization, item.role].filter(Boolean).join('|'),
        organization: sanitizeString(item.organization),
        role: sanitizeString(item.role),
        description: sanitizeString(item.responsibilities),
        duration: formatDuration({
          fromYear: item.from_year,
          toYear: item.to_year,
          ongoing: item.ongoing === true,
        }),
      }))
      .filter((entry) => entry.organization || entry.role)
  }

  const resolveLanguages = (
    entries: ProfessionalLanguage[] | null | undefined
  ) => {
    if (!Array.isArray(entries)) return []
    return entries
      .map((language) => {
        const label = [
          sanitizeString(language.language),
          sanitizeString(language.proficiency),
        ]
          .filter(Boolean)
          .join(' — ')
          .trim()
        return label ? { label } : null
      })
      .filter((item): item is { label: string } => Boolean(item))
  }

  const rawRelevant = resolveExperience(model.relevant_experience)
  const rawOther = resolveExperience(
    model.other_experience ?? model.other_employment_experience
  )
  const education = resolveEducation(model.education)
  const certifications = resolveCertifications(model.certifications)
  const projects = resolveProjects(model.projects)
  const volunteering = resolveVolunteering(model.volunteering)
  const languages = resolveLanguages(model.languages)

  let location: string | null = null
  if (Array.isArray(model.locations) && model.locations.length > 0) {
    const firstLocation = model.locations[0]
    const formatted =
      sanitizeString(firstLocation?.formatted_address) ??
      sanitizeString(firstLocation?.short_address)
    if (formatted) {
      const radiusValue = Number(firstLocation?.radius)
      const radius =
        Number.isFinite(radiusValue) && radiusValue > 0
          ? `${radiusValue}km radius`
          : null
      location = radius ? `${formatted} · ${radius}` : formatted
    }
  }

  return {
    name: displayName ?? 'Professional',
    initials: displayName
      ? displayName
          .split(' ')
          .map((segment: string) => segment[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'PR',
    subtitle:
      sanitizeString(model.subtitle) ?? sanitizeString(model.title) ?? null,
    badges: Array.isArray(model.badges)
      ? model.badges
          .map((badge: unknown) => sanitizeString(badge as any))
          .filter((badge): badge is string => Boolean(badge))
      : [],
    bio: sanitizeString(model.bio_long) ?? sanitizeString(model.bio_short),
    avatar:
      sanitizeString(model.avatar_url) ?? sanitizeString(model.avatar) ?? null,
    location,
    verified: model.verified === true,
    languages,
    relevantExperience: rawRelevant,
    otherExperience: rawOther,
    education,
    certifications,
    projects,
    volunteering,
    experienceCount: rawRelevant.length ? `${rawRelevant.length}` : null,
    otherCount: rawOther.length ? `${rawOther.length}` : null,
    educationCount: education.length ? `${education.length}` : null,
  }
})
</script>
