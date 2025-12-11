<template>
  <UCard
    v-if="agent"
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
          :src="agent.avatarUrl"
          :alt="agencyName"
          size="2xl"
          :text="getInitials(agencyName)"
          class="self-start"
        />
        <div
          v-if="agent.verified"
          class="flex items-center gap-1 text-sm font-medium text-primary-600"
        >
          <UIcon name="i-heroicons-check-badge" class="h-5 w-5" />
          <span>Verified Business</span>
        </div>
      </div>

      <div :class="[ui.layout.infoStack, 'gap-3']">
        <h1 :class="ui.text.nameXl">
          {{ agencyName }}
        </h1>

        <p v-if="agent.business_type" class="text-base text-gray-600">
          {{ agent.business_type }}
        </p>
        <p v-if="agent.title" :class="ui.text.meta">
          {{ agent.title }}
        </p>

        <div
          v-if="agent.website"
          class="flex items-center gap-2 text-sm text-primary-600"
        >
          <UIcon name="i-heroicons-globe-alt" class="h-4 w-4" />
          <a
            :href="agent.website"
            target="_blank"
            rel="noreferrer"
            class="font-medium hover:underline"
          >
            {{ agent.website }}
          </a>
        </div>

        <div v-if="agent.locations?.length" :class="ui.layout.metaRow">
          <UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-gray-400" />
          <span>{{ formatLocation(agent.locations[0]) }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-8">
      <section v-if="agent.bio_short || agent.bio_long" class="space-y-2">
        <h3 :class="ui.text.nameMd">About Our Company</h3>
        <p :class="ui.text.body">
          {{ agent.bio_long || agent.bio_short }}
        </p>
      </section>

      <section v-if="hasBusinessStats" class="space-y-3">
        <h3 :class="ui.text.nameMd">Company Overview</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-if="agent.employee_count" :class="statClasses">
            <UIcon name="i-heroicons-users" class="h-5 w-5 text-gray-400" />
            <div>
              <p :class="ui.text.nameLg">{{ agent.employee_count }}</p>
              <p :class="ui.text.labelSm">Employees</p>
            </div>
          </div>
          <div v-if="agent.years_established" :class="statClasses">
            <UIcon name="i-heroicons-calendar" class="h-5 w-5 text-gray-400" />
            <div>
              <p :class="ui.text.nameLg">{{ agent.years_established }}</p>
              <p :class="ui.text.labelSm">Years Established</p>
            </div>
          </div>
          <div v-if="agent.covers_per_service" :class="statClasses">
            <UIcon name="i-heroicons-chart-bar" class="h-5 w-5 text-gray-400" />
            <div>
              <p :class="ui.text.nameLg">{{ agent.covers_per_service }}</p>
              <p :class="ui.text.labelSm">Covers/Service</p>
            </div>
          </div>
          <div v-if="agent.total_jobs_posted" :class="statClasses">
            <UIcon name="i-heroicons-briefcase" class="h-5 w-5 text-gray-400" />
            <div>
              <p :class="ui.text.nameLg">{{ agent.total_jobs_posted }}</p>
              <p :class="ui.text.labelSm">Jobs Posted</p>
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="
          agent.specialties?.length ||
          agent.cuisine_types?.length ||
          agent.establishment_type?.length
        "
        class="space-y-4"
      >
        <h3 :class="ui.text.nameMd">Specialties & Cuisine</h3>

        <div v-if="agent.specialties?.length" class="space-y-2">
          <h4 :class="ui.text.meta">Business Specialties</h4>
          <div :class="ui.chip.group">
            <UBadge
              v-for="specialty in agent.specialties"
              :key="specialty"
              variant="soft"
              size="md"
            >
              {{ specialty }}
            </UBadge>
          </div>
        </div>

        <div v-if="agent.cuisine_types?.length" class="space-y-2">
          <h4 :class="ui.text.meta">Cuisine Types</h4>
          <div :class="ui.chip.group">
            <UBadge
              v-for="cuisine in agent.cuisine_types"
              :key="cuisine"
              variant="outline"
              size="md"
            >
              {{ cuisine }}
            </UBadge>
          </div>
        </div>

        <div v-if="agent.establishment_type?.length" class="space-y-2">
          <h4 :class="ui.text.meta">Establishment Type</h4>
          <div :class="ui.chip.group">
            <UBadge
              v-for="type in agent.establishment_type"
              :key="type"
              variant="subtle"
              size="md"
            >
              {{ type }}
            </UBadge>
          </div>
        </div>
      </section>

      <section v-if="agent.active_jobs?.length" class="space-y-4">
        <h3 :class="ui.text.nameMd">Current Job Openings</h3>
        <div class="grid gap-4">
          <article
            v-for="job in agent.active_jobs"
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

      <section v-if="agent.operating_hours" class="space-y-3">
        <h3 :class="ui.text.nameMd">Operating Hours</h3>
        <div class="grid gap-2 sm:grid-cols-2">
          <div
            v-for="(hours, day) in agent.operating_hours"
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

      <section v-if="agent.contacts?.length" class="space-y-3">
        <h3 :class="ui.text.nameMd">Contact Information</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="contact in agent.contacts"
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

      <section v-if="agent.social_media && hasSocialMedia" class="space-y-3">
        <h3 :class="ui.text.nameMd">Follow Us</h3>
        <div class="flex flex-wrap gap-3">
          <a
            v-if="agent.social_media.instagram"
            :href="agent.social_media.instagram"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <UIcon name="i-simple-icons-instagram" />
            Instagram
          </a>
          <a
            v-if="agent.social_media.facebook"
            :href="agent.social_media.facebook"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <UIcon name="i-simple-icons-facebook" />
            Facebook
          </a>
          <a
            v-if="agent.social_media.linkedin"
            :href="agent.social_media.linkedin"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
          >
            <UIcon name="i-simple-icons-linkedin" />
            LinkedIn
          </a>
          <a
            v-if="agent.social_media.twitter"
            :href="agent.social_media.twitter"
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
      No agent profile found
    </h2>
    <p>This profile may have been removed or is not available.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Loosen typing to accommodate varied data shapes during migration
const props = defineProps<{
  agent?: any
}>()

const ui = {
  surface: {
    base: 'bg-white border border-gray-100 rounded-3xl shadow-sm',
    padding: {
      spacious: 'p-8 sm:p-10',
      comfy: 'p-4 sm:p-5',
      compact: 'p-3',
    },
  },
  layout: {
    hero: 'flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between',
    infoStack: 'flex flex-col text-gray-800',
    metaRow: 'flex items-center gap-2 text-sm text-gray-500',
  },
  text: {
    nameXl: 'text-3xl font-semibold text-gray-900',
    nameLg: 'text-2xl font-semibold text-gray-900',
    nameMd: 'text-xl font-semibold text-gray-900',
    meta: 'text-sm text-gray-500',
    body: 'text-base leading-relaxed text-gray-600',
    labelSm: 'text-xs uppercase tracking-wide text-gray-500',
  },
  chip: {
    group: 'flex flex-wrap gap-2',
  },
}

const statClasses =
  'bg-gray-50 border border-gray-200/70 rounded-xl p-4 flex items-center gap-3 text-sm text-gray-600'

const agencyName = computed(() => {
  const agent: any = props.agent
  return (
    agent?.title || agent?.displayName || agent?.user?.display_name || 'Agent'
  )
})

// Helper functions for template use only - no complex logic
const hasBusinessStats = computed(() => {
  const e: any = props.agent
  return !!(
    e?.employee_count ||
    e?.years_established ||
    e?.covers_per_service ||
    e?.total_jobs_posted
  )
})

const hasSocialMedia = computed(() => {
  const e: any = props.agent
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
