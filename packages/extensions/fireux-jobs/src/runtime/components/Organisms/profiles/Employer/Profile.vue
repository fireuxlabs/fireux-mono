<template>
  <UCard
    v-if="employer"
    :class="[
      ui.surface.base,
      ui.surface.padding.spacious,
      'max-w-4xl',
      'space-y-10',
    ]"
  >
    <div :class="ui.layout.hero">
      <div class="flex flex-col items-start gap-3">
        <UAvatar
          :src="employer.avatarUrl"
          :alt="employer.company_name || employer.displayName"
          size="2xl"
          :text="getInitials(employer.company_name || employer.displayName)"
          class="self-start"
        />
        <div
          v-if="employer.verified"
          class="flex items-center gap-1 text-sm font-medium text-primary-600"
        >
          <UIcon name="i-heroicons-check-badge" class="h-5 w-5" />
          <span>Verified Business</span>
        </div>
      </div>

      <div :class="[ui.layout.infoStack, 'gap-3']">
        <h1 :class="ui.text.nameXl">
          {{ employer.company_name || employer.displayName }}
        </h1>

        <p v-if="employer.business_type" class="text-base text-gray-600">
          {{ employer.business_type }}
        </p>
        <p v-if="employer.title" :class="ui.text.meta">
          {{ employer.title }}
        </p>

        <div
          v-if="employer.website"
          class="flex items-center gap-2 text-sm text-primary-600"
        >
          <UIcon name="i-heroicons-globe-alt" class="h-4 w-4" />
          <a
            :href="employer.website"
            target="_blank"
            rel="noreferrer"
            class="font-medium hover:underline"
          >
            {{ employer.website }}
          </a>
        </div>

        <div v-if="employer.locations?.length" :class="ui.layout.metaRow">
          <UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-gray-400" />
          <span>{{ formatLocation(employer.locations[0]) }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-8">
      <section v-if="employer.bio_short || employer.bio_long" class="space-y-2">
        <h3 :class="ui.text.nameMd">About Our Company</h3>
        <p :class="ui.text.body">
          {{ employer.bio_long || employer.bio_short }}
        </p>
      </section>

      <section v-if="hasBusinessStats" class="space-y-3">
        <h3 :class="ui.text.nameMd">Company Overview</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-if="employer.employee_count" :class="statClasses">
            <UIcon name="i-heroicons-users" class="h-5 w-5 text-gray-400" />
            <div>
              <p :class="ui.text.nameLg">{{ employer.employee_count }}</p>
              <p :class="ui.text.labelSm">Employees</p>
            </div>
          </div>
          <div v-if="employer.years_established" :class="statClasses">
            <UIcon name="i-heroicons-calendar" class="h-5 w-5 text-gray-400" />
            <div>
              <p :class="ui.text.nameLg">{{ employer.years_established }}</p>
              <p :class="ui.text.labelSm">Years Established</p>
            </div>
          </div>
          <div v-if="employer.covers_per_service" :class="statClasses">
            <UIcon name="i-heroicons-chart-bar" class="h-5 w-5 text-gray-400" />
            <div>
              <p :class="ui.text.nameLg">{{ employer.covers_per_service }}</p>
              <p :class="ui.text.labelSm">Covers/Service</p>
            </div>
          </div>
          <div v-if="employer.total_jobs_posted" :class="statClasses">
            <UIcon name="i-heroicons-briefcase" class="h-5 w-5 text-gray-400" />
            <div>
              <p :class="ui.text.nameLg">{{ employer.total_jobs_posted }}</p>
              <p :class="ui.text.labelSm">Jobs Posted</p>
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="
          employer.specialties?.length ||
          employer.cuisine_types?.length ||
          employer.establishment_type?.length
        "
        class="space-y-4"
      >
        <h3 :class="ui.text.nameMd">Specialties & Cuisine</h3>

        <div v-if="employer.specialties?.length" class="space-y-2">
          <h4 :class="ui.text.meta">Business Specialties</h4>
          <div :class="ui.chip.group">
            <UBadge
              v-for="specialty in employer.specialties"
              :key="specialty"
              variant="soft"
              size="md"
            >
              {{ specialty }}
            </UBadge>
          </div>
        </div>

        <div v-if="employer.cuisine_types?.length" class="space-y-2">
          <h4 :class="ui.text.meta">Cuisine Types</h4>
          <div :class="ui.chip.group">
            <UBadge
              v-for="cuisine in employer.cuisine_types"
              :key="cuisine"
              variant="outline"
              size="md"
            >
              {{ cuisine }}
            </UBadge>
          </div>
        </div>

        <div v-if="employer.establishment_type?.length" class="space-y-2">
          <h4 :class="ui.text.meta">Establishment Type</h4>
          <div :class="ui.chip.group">
            <UBadge
              v-for="type in employer.establishment_type"
              :key="type"
              variant="subtle"
              size="md"
            >
              {{ type }}
            </UBadge>
          </div>
        </div>
      </section>

      <section v-if="employer.active_jobs?.length" class="space-y-4">
        <h3 :class="ui.text.nameMd">Current Job Openings</h3>
        <div class="grid gap-4">
          <article
            v-for="job in employer.active_jobs"
            :key="job.id"
            :class="[ui.surface.base, ui.surface.padding.comfy, 'space-y-3']"
          >
            <header class="flex flex-wrap items-center justify-between gap-3">
              <h4 :class="ui.text.nameMd">{{ job.title }}</h4>
              <UBadge :variant="getJobTypeVariant(job.type)" size="sm">
                {{ job.type }}
              </UBadge>
            </header>

            <p class="text-sm text-gray-500">{{ job.location }}</p>
            <p v-if="job.salary_range" class="text-sm text-gray-500">
              {{ job.salary_range }}
            </p>
            <p v-if="job.description" :class="ui.text.body">
              {{ job.description }}
            </p>

            <div v-if="job.requirements?.length" class="space-y-2">
              <h5 :class="ui.text.meta">Requirements</h5>
              <ul class="list-disc space-y-1 pl-5 text-sm text-gray-500">
                <li v-for="req in job.requirements" :key="req">{{ req }}</li>
              </ul>
            </div>

            <p class="text-xs uppercase tracking-wide text-gray-400">
              Posted {{ formatDate(job.posted_at) }}
            </p>
          </article>
        </div>
      </section>

      <section v-if="employer.operating_hours" class="space-y-3">
        <h3 :class="ui.text.nameMd">Operating Hours</h3>
        <div class="grid gap-2 sm:grid-cols-2">
          <div
            v-for="(hours, day) in employer.operating_hours"
            :key="day"
            :class="[
              ui.surface.base,
              ui.surface.padding.compact,
              'flex items-center justify-between text-sm text-gray-600',
            ]"
          >
            <span class="font-medium text-gray-900">
              {{ formatDayName(day) }}
            </span>
            <span v-if="hours.closed" class="text-gray-400">Closed</span>
            <span v-else>{{ hours.open }} - {{ hours.close }}</span>
          </div>
        </div>
      </section>

      <section v-if="employer.contacts?.length" class="space-y-3">
        <h3 :class="ui.text.nameMd">Contact Information</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="contact in employer.contacts"
            :key="contact.email || contact.name"
            :class="[
              ui.surface.base,
              ui.surface.padding.compact,
              'space-y-1 text-sm text-gray-600',
            ]"
          >
            <h4 :class="ui.text.nameMd">{{ contact.name }}</h4>
            <p class="text-sm text-gray-500">{{ contact.title }}</p>
            <p v-if="contact.phone" class="text-sm text-gray-500">
              {{ contact.phone }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="employer.social_media && hasSocialMedia" class="space-y-3">
        <h3 :class="ui.text.nameMd">Follow Us</h3>
        <div class="flex flex-wrap gap-3">
          <a
            v-if="employer.social_media.instagram"
            :href="employer.social_media.instagram"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <UIcon name="i-simple-icons-instagram" />
            Instagram
          </a>
          <a
            v-if="employer.social_media.facebook"
            :href="employer.social_media.facebook"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <UIcon name="i-simple-icons-facebook" />
            Facebook
          </a>
          <a
            v-if="employer.social_media.linkedin"
            :href="employer.social_media.linkedin"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <UIcon name="i-simple-icons-linkedin" />
            LinkedIn
          </a>
          <a
            v-if="employer.social_media.twitter"
            :href="employer.social_media.twitter"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <UIcon name="i-simple-icons-twitter" />
            Twitter
          </a>
        </div>
      </section>
    </div>
  </UCard>

  <div
    v-else
    class="flex flex-col items-center gap-3 py-16 text-sm text-gray-500"
  >
    <UIcon name="i-lucide-building" class="h-10 w-10 text-gray-300" />
    <h2 class="text-base font-semibold text-gray-700">
      No employer profile found
    </h2>
    <p>This profile may have been removed or is not available.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Loosen typing to accommodate varied data shapes during migration
const props = defineProps<{
  employer?: any
}>()

const statClasses =
  'bg-gray-50 border border-gray-200/70 rounded-xl p-4 flex items-center gap-3 text-sm text-gray-600'

// Helper functions for template use only - no complex logic
const hasBusinessStats = computed(() => {
  const e: any = props.employer
  return !!(
    e?.employee_count ||
    e?.years_established ||
    e?.covers_per_service ||
    e?.total_jobs_posted
  )
})

const hasSocialMedia = computed(() => {
  const e: any = props.employer
  const sm = e?.social_media || {}
  return !!(sm.instagram || sm.facebook || sm.linkedin || sm.twitter)
})
function getInitials(name?: string) {
  if (!name) return 'E'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatLocation(location?: any) {
  if (!location) return ''
  if (typeof location === 'string') return location
  if (location?.formatted_address) return String(location.formatted_address)
  if (Array.isArray(location?.locations) && location.locations.length > 0) {
    return String(location.locations[0]?.formatted_address || '')
  }
  return ''
}

function getJobTypeVariant(
  type?: string
): 'solid' | 'outline' | 'soft' | 'subtle' {
  const variants: Record<string, 'solid' | 'outline' | 'soft' | 'subtle'> = {
    'full-time': 'solid',
    'part-time': 'soft',
    contract: 'outline',
    temporary: 'subtle',
  }
  return variants[type || ''] || 'outline'
}

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

function formatDayName(day?: string | number) {
  const days = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }
  const key = String(day || '').toLowerCase() as keyof typeof days
  return days[key] || String(day || '')
}
</script>
