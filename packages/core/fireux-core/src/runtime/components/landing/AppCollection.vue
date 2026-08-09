<!-- Concurrent edit — 2026-07-23 — Render the canonical public App projection inside product landings. -->
<template>
  <section
    v-if="shouldRender"
    class="landing-app-collection"
    aria-labelledby="landing-product-apps-title"
  >
    <div class="landing-app-collection__heading">
      <div>
        <p v-if="eyebrow" class="fx-type-headline">{{ eyebrow }}</p>
        <h2 id="landing-product-apps-title">{{ title }}</h2>
      </div>

      <div>
        <p v-if="description">{{ description }}</p>
        <UButton
          :to="actionTo"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ actionLabel }}
        </UButton>
      </div>
    </div>

    <div
      v-show="outcome === 'pending'"
      key="apps-loading"
      class="landing-app-collection__rail"
      aria-label="Loading apps"
    >
      <UPageCard
        v-for="index in 3"
        :key="index"
        variant="subtle"
        class="landing-app-collection__card"
      >
        <USkeleton class="aspect-[16/9] w-full rounded-xl" />
        <USkeleton class="h-5 w-2/3" />
        <USkeleton class="h-12 w-full" />
      </UPageCard>
    </div>

    <UAlert
      v-if="outcome === 'error'"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Apps could not be loaded"
      description="Please try the public App collection again."
      :actions="[
        {
          label: 'Try again',
          color: 'error',
          variant: 'soft',
          onClick: refreshApps,
        },
      ]"
    />

    <div
      v-show="outcome === 'ready' && apps.length"
      key="apps-ready"
      class="landing-app-collection__rail"
      aria-label="Apps"
    >
      <UPageCard
        v-for="app in apps"
        :key="app.id"
        :to="app.detail_url"
        variant="subtle"
        class="landing-app-collection__card"
      >
        <div class="landing-app-collection__media">
          <img
            v-if="mediaUrl(app)"
            :src="mediaUrl(app)"
            :alt="`${displayName(app)} app preview`"
            loading="lazy"
            decoding="async"
          />
          <UIcon v-else name="i-lucide-app-window" aria-hidden="true" />

          <div class="landing-app-collection__identity">
            <div
              v-if="wordmarkUrl(app)"
              class="landing-app-collection__wordmark"
              :class="{
                'landing-app-collection__wordmark--labelled': mediaLabel(app),
              }"
            >
              <img
                :src="wordmarkUrl(app)"
                :alt="displayName(app)"
                loading="lazy"
                decoding="async"
              />
              <span v-if="mediaLabel(app)">
                {{ mediaLabel(app) }}
              </span>
            </div>
            <UAvatar
              v-else
              :src="logoUrl(app) || undefined"
              :text="avatarText(app)"
              :alt="displayName(app)"
              size="lg"
            />
          </div>
        </div>

        <div class="landing-app-collection__body">
          <div>
            <p>{{ roleLabel(app) }}</p>
            <h3>{{ displayName(app) }}</h3>
          </div>
          <p>{{ appSummary(app) }}</p>
          <span>
            Explore {{ displayName(app) }}
            <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </span>
        </div>
      </UPageCard>
    </div>

    <MoleculesStateCard
      v-if="outcome === 'empty' || (outcome === 'ready' && !apps.length)"
      entity="apps"
      state="empty"
      surface="bare"
      title="No published apps yet"
      description="Active apps in this ecosystem will appear here."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppDirectoryEntry } from '../../models/utils/directory'
import type { AppDirectoryController } from '../../types/directory-controller.types'

type LandingAppMediaOverride = {
  coverUrl?: string
  logoUrl?: string
  mediaLabel?: string
  wordmarkUrl?: string
}

const props = withDefaults(
  defineProps<{
    controller: AppDirectoryController
    eyebrow?: string
    title: string
    description?: string
    actionLabel?: string
    actionTo?: string
    excludeIds?: readonly string[]
    featuredIds?: readonly string[]
    limit?: number
    mediaOverrides?: Readonly<Record<string, LandingAppMediaOverride>>
    minimumItems?: number
  }>(),
  {
    actionLabel: 'Explore all apps',
    actionTo: '/apps',
    excludeIds: () => [],
    featuredIds: () => [],
    limit: 0,
    mediaOverrides: () => ({}),
    minimumItems: 1,
  }
)

const excludedIds = computed(() => new Set(props.excludeIds))
const apps = computed(() => {
  const available = props.controller.apps.value.filter(
    (app) => app.status === 'active' && !excludedIds.value.has(app.id)
  )
  const selected = props.featuredIds.length
    ? props.featuredIds
        .map((id) => available.find((app) => app.id === id))
        .filter((app): app is AppDirectoryEntry => Boolean(app))
    : available

  return props.limit > 0 ? selected.slice(0, props.limit) : selected
})
const outcome = computed(() => props.controller.outcome.value)
const shouldRender = computed(
  () =>
    outcome.value === 'pending' ||
    outcome.value === 'error' ||
    apps.value.length >= props.minimumItems
)

async function refreshApps(): Promise<void> {
  await props.controller.refresh?.()
}

function displayName(app: AppDirectoryEntry): string {
  return app.app_name || app.app_short_name || app.slug || app.id
}

function roleLabel(app: AppDirectoryEntry): string {
  if (app.role === 'global') return 'Ecosystem App'
  if (app.role === 'tenant') return 'Tenant App'
  if (app.role === 'standalone') return 'Standalone App'
  return 'App'
}

function appSummary(app: AppDirectoryEntry): string {
  return app.tagline || app.short_bio || app.description
}

function portableMediaUrl(value: unknown): string {
  const url = String(value || '').trim()
  return /^https?:\/\//i.test(url) ? url : ''
}

function mediaUrl(app: AppDirectoryEntry): string {
  return (
    portableMediaUrl(props.mediaOverrides[app.id]?.coverUrl) ||
    portableMediaUrl(app.media?.cover_url) ||
    portableMediaUrl(app.media?.thumbnail_url) ||
    portableMediaUrl(app.media?.logo_url)
  )
}

function logoUrl(app: AppDirectoryEntry): string {
  return (
    portableMediaUrl(props.mediaOverrides[app.id]?.logoUrl) ||
    portableMediaUrl(app.media?.logo_url) ||
    portableMediaUrl(app.media?.thumbnail_url)
  )
}

function wordmarkUrl(app: AppDirectoryEntry): string {
  return portableMediaUrl(props.mediaOverrides[app.id]?.wordmarkUrl)
}

function mediaLabel(app: AppDirectoryEntry): string {
  return String(props.mediaOverrides[app.id]?.mediaLabel || '').trim()
}

function avatarText(app: AppDirectoryEntry): string {
  return displayName(app)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
</script>

<style scoped src="./AppCollection.css"></style>
