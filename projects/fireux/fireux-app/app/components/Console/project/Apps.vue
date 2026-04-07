<template>
  <section class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="text-sm font-semibold">Apps in this live project</div>
            <p class="text-sm text-dimmed">
              Live app identity and SEO are fetched from each app endpoint.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="soft">
              {{ appRows.length }} app{{ appRows.length === 1 ? '' : 's' }}
            </UBadge>
            <UBadge color="neutral" variant="soft">
              {{ liveCount }} live
            </UBadge>
            <UBadge
              v-if="failedCount"
              color="warning"
              variant="soft"
            >
              {{ failedCount }} flagged
            </UBadge>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :loading="pending"
              @click="refresh()"
            >
              Refresh
            </UButton>
          </div>
        </div>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton
          to="/apps"
          icon="i-lucide-app-window"
          variant="ghost"
          color="neutral"
        >
          Open public index
        </UButton>
      </div>
    </UCard>

    <UAlert
      v-if="liveError"
      color="warning"
      variant="soft"
      title="Live app refresh failed"
      :description="liveError"
    />

    <UAlert
      v-if="!appRows.length"
      color="neutral"
      variant="soft"
      title="No apps found"
    />

    <UCard
      v-for="app in appRows"
      :key="app.id"
    >
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <img
              v-if="app.imageUrl"
              :src="app.imageUrl"
              :alt="app.name"
              class="h-12 w-12 rounded-lg object-cover ring ring-default"
            />

            <div class="space-y-1">
              <div class="text-sm font-semibold">{{ app.name }}</div>
              <p v-if="app.description" class="text-sm text-dimmed">
                {{ app.description }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge variant="soft">{{ app.status }}</UBadge>
            <UBadge
              v-if="app.healthLabel"
              :color="app.healthColor"
              variant="soft"
            >
              {{ app.healthLabel }}
            </UBadge>
          </div>
        </div>
      </template>

      <div class="space-y-3">
        <div class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
          <div>
            Ecosystem:
            <span class="font-medium text-default">{{ app.ecosystemName || 'Unassigned' }}</span>
          </div>
          <div v-if="app.primaryTopic">
            Topic:
            <span class="font-medium text-default">{{ app.primaryTopic }}</span>
          </div>
          <div v-if="app.seoTitle">
            SEO Title:
            <span class="font-medium text-default">{{ app.seoTitle }}</span>
          </div>
          <div v-if="app.website">
            Website:
            <a :href="app.website" target="_blank" rel="noreferrer" class="font-medium text-primary underline-offset-4 hover:underline">
              {{ app.website }}
            </a>
          </div>
        </div>

        <p v-if="app.summary" class="text-sm text-dimmed">
          {{ app.summary }}
        </p>

        <div v-if="app.highlightTerms.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="term in app.highlightTerms"
            :key="term"
            color="neutral"
            variant="soft"
          >
            {{ term }}
          </UBadge>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="app.website"
            :to="app.website"
            target="_blank"
            rel="noreferrer"
            color="neutral"
            variant="soft"
            icon="i-lucide-external-link"
          >
            Open app
          </UButton>
          <UButton
            v-if="app.infoUrl"
            :to="app.infoUrl"
            target="_blank"
            rel="noreferrer"
            color="neutral"
            variant="ghost"
            icon="i-lucide-file-json"
          >
            Info
          </UButton>
          <UButton
            v-if="app.metaUrl"
            :to="app.metaUrl"
            target="_blank"
            rel="noreferrer"
            color="neutral"
            variant="ghost"
            icon="i-lucide-file-search"
          >
            Meta
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActiveProject } from 'fireux-core/runtime/composables/fireux/app/project-console/useActiveProject'

type FireuxConsoleApp = {
  id: string
  name: string
  slug: string
  ecosystem_id: string
  website: string
  image_url: string
  logo_url: string
  thumbnail_url: string
}

type FireuxConsolePayload = {
  project: {
    id: string
    main_app_id: string
  }
  project_meta: {
    source_url: string
  }
  databases: Array<{
    name: string
    apps: FireuxConsoleApp[]
  }>
}

type PublicAppInfo = {
  app?: {
    name?: string
    media?: {
      logo_url?: string
      thumbnail_url?: string
    }
  }
  ecosystem?: {
    name?: string
  }
}

type PublicAppMeta = {
  messaging?: {
    summary?: string
    highlight_terms?: string[]
  }
  seo?: {
    title?: string
    description?: string
    primary_topic?: string
  }
}

type LiveAppRow = {
  id: string
  name: string
  description: string
  ecosystemName: string
  status: string
  imageUrl: string
  website: string
  summary: string
  highlightTerms: string[]
  seoTitle: string
  primaryTopic: string
  healthLabel: string
  healthColor: 'success' | 'warning'
  infoUrl: string
  metaUrl: string
}

const runtime = useActiveProject()

const normalizeString = (value: unknown): string => String(value || '').trim()
const labelize = (value: unknown): string =>
  normalizeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')

const resolveConsoleEndpoint = () => {
  const raw =
    normalizeString((runtime.project.value as any)?.console_endpoint_url) ||
    normalizeString((runtime.project.value as any)?.source_url)

  if (!raw) return ''

  try {
    const url = new URL(raw)
    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = '/api/fireux-console'
    }
    return url.toString()
  } catch {
    return ''
  }
}

const endpointKey = computed(() => `${runtime.id.value}:${resolveConsoleEndpoint()}`)

const {
  data: liveAppsData,
  pending,
  error: liveAppsError,
  refresh,
} = await useAsyncData(
  'console-project-apps-live',
  async () => {
    const consoleEndpoint = resolveConsoleEndpoint()
    if (!consoleEndpoint) {
      throw new Error('Project console endpoint is missing')
    }

    const payload = await $fetch<FireuxConsolePayload>(consoleEndpoint)
    const allApps = payload.databases
      .flatMap((database) => database.apps)
      .filter((app, index, array) => array.findIndex((entry) => entry.id === app.id) === index)

    return await Promise.all(
      allApps.map(async (app): Promise<LiveAppRow> => {
        const website =
          normalizeString(app.website) ||
          (app.id === normalizeString(payload.project.main_app_id)
            ? normalizeString(payload.project_meta.source_url)
            : '')
        const infoUrl = website ? `${website.replace(/\/+$/, '')}/api/public/app/info` : ''
        const metaUrl = website ? `${website.replace(/\/+$/, '')}/api/public/app/meta` : ''

        try {
          const [info, meta] = await Promise.all([
            infoUrl ? $fetch<PublicAppInfo>(infoUrl) : Promise.resolve({}),
            metaUrl ? $fetch<PublicAppMeta>(metaUrl) : Promise.resolve({}),
          ])

          return {
            id: app.id,
            name:
              normalizeString(info.app?.name) ||
              normalizeString(app.name) ||
              labelize(app.slug || app.id) ||
              app.id,
            description:
              normalizeString(meta.seo?.description) ||
              normalizeString(meta.messaging?.summary),
            ecosystemName:
              normalizeString(info.ecosystem?.name) ||
              labelize(app.ecosystem_id),
            status: 'live',
            imageUrl:
              normalizeString(info.app?.media?.logo_url) ||
              normalizeString(info.app?.media?.thumbnail_url) ||
              normalizeString(app.logo_url) ||
              normalizeString(app.thumbnail_url) ||
              normalizeString(app.image_url),
            website,
            summary: normalizeString(meta.messaging?.summary),
            highlightTerms: Array.isArray(meta.messaging?.highlight_terms)
              ? meta.messaging.highlight_terms.map((term) => normalizeString(term)).filter(Boolean)
              : [],
            seoTitle: normalizeString(meta.seo?.title),
            primaryTopic: normalizeString(meta.seo?.primary_topic),
            healthLabel: website ? 'Live' : 'Missing URL',
            healthColor: website ? 'success' : 'warning',
            infoUrl,
            metaUrl,
          }
        } catch {
          return {
            id: app.id,
            name: normalizeString(app.name) || labelize(app.slug || app.id) || app.id,
            description: 'Public endpoint refresh failed for this app.',
            ecosystemName: labelize(app.ecosystem_id),
            status: 'flagged',
            imageUrl:
              normalizeString(app.logo_url) ||
              normalizeString(app.thumbnail_url) ||
              normalizeString(app.image_url),
            website,
            summary: '',
            highlightTerms: [],
            seoTitle: '',
            primaryTopic: '',
            healthLabel: website ? 'Endpoint failed' : 'Missing URL',
            healthColor: 'warning',
            infoUrl,
            metaUrl,
          }
        }
      })
    )
  },
  {
    server: false,
    default: () => [],
    watch: [endpointKey],
  }
)

const appRows = computed(() => liveAppsData.value ?? [])
const liveError = computed(() => normalizeString(liveAppsError.value?.message))
const liveCount = computed(
  () => appRows.value.filter((entry) => entry.healthLabel === 'Live').length
)
const failedCount = computed(
  () => appRows.value.filter((entry) => entry.healthLabel !== 'Live').length
)
</script>
