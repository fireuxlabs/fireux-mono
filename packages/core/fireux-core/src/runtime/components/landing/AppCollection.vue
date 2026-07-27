<!-- Concurrent edit — 2026-07-23 — Render the canonical public App projection inside product landings. -->
<template>
  <div class="landing-app-collection">
    <div class="landing-app-collection__heading">
      <div>
        <p class="fx-type-headline">{{ eyebrow }}</p>
        <h2 id="landing-product-apps-title">{{ title }}</h2>
      </div>

      <div>
        <p>{{ description }}</p>
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
      v-if="outcome === 'pending'"
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
      v-else-if="outcome === 'error'"
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
          onClick: () => controller.refresh(),
        },
      ]"
    />

    <div
      v-else-if="apps.length"
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
          >
          <UIcon
            v-else
            name="i-lucide-app-window"
            aria-hidden="true"
          />

          <div class="landing-app-collection__identity">
            <UAvatar
              :src="logoUrl(app) || undefined"
              :text="avatarText(app)"
              :alt="displayName(app)"
              size="lg"
            />
            <UBadge color="neutral" variant="solid" size="sm">
              Live app
            </UBadge>
          </div>
        </div>

        <div class="landing-app-collection__body">
          <div>
            <p>{{ roleLabel(app) }}</p>
            <h3>{{ displayName(app) }}</h3>
          </div>
          <p>{{ app.description }}</p>
          <span>
            View app
            <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </span>
        </div>
      </UPageCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="apps"
      state="empty"
      surface="bare"
      title="No published apps yet"
      description="Active apps in this ecosystem will appear here."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  AppDirectoryController,
  AppDirectoryEntry,
} from '../../models/core/supporting/directory'

const props = withDefaults(
  defineProps<{
    controller: AppDirectoryController
    eyebrow: string
    title: string
    description: string
    actionLabel?: string
    actionTo?: string
    excludeIds?: readonly string[]
  }>(),
  {
    actionLabel: 'Explore all apps',
    actionTo: '/apps',
    excludeIds: () => [],
  }
)

const excludedIds = computed(() => new Set(props.excludeIds))
const apps = computed(() =>
  props.controller.apps.value.filter(
    app => app.status === 'active' && !excludedIds.value.has(app.id)
  )
)
const outcome = computed(() => props.controller.outcome.value)

function displayName(app: AppDirectoryEntry): string {
  return app.app_name || app.app_short_name || app.slug || app.id
}

function roleLabel(app: AppDirectoryEntry): string {
  return app.role === 'global' ? 'Platform app' : 'Hospitality app'
}

function portableMediaUrl(value: unknown): string {
  const url = String(value || '').trim()
  return /^https?:\/\//i.test(url) ? url : ''
}

function mediaUrl(app: AppDirectoryEntry): string {
  return (
    portableMediaUrl(app.media?.cover_url)
    || portableMediaUrl(app.media?.thumbnail_url)
    || portableMediaUrl(app.media?.logo_url)
  )
}

function logoUrl(app: AppDirectoryEntry): string {
  return (
    portableMediaUrl(app.media?.logo_url)
    || portableMediaUrl(app.media?.thumbnail_url)
  )
}

function avatarText(app: AppDirectoryEntry): string {
  return displayName(app)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-app-collection {
  display: grid;
  gap: calc(var(--spacing) * 8);
}

.landing-app-collection :where(h2, h3, p) {
  margin: 0;
}

.landing-app-collection__heading {
  display: grid;
  gap: calc(var(--spacing) * 5);
}

.landing-app-collection__heading > div {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.landing-app-collection__heading h2 {
  max-width: 13ch;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-4xl), 11vw, 3.15rem);
  font-weight: 920;
  letter-spacing: -0.06em;
  line-height: 0.98;
  text-wrap: balance;
}

.landing-app-collection__heading > div:last-child > p {
  max-width: 42rem;
  color: var(--ui-text-muted);
  font-size: 0.94rem;
  line-height: 1.62;
}

.landing-app-collection__heading :deep(a) {
  justify-content: center;
  width: 100%;
  min-height: 2.75rem;
}

.landing-app-collection__rail {
  display: grid;
  grid-auto-columns: minmax(82%, 1fr);
  grid-auto-flow: column;
  overflow-x: auto;
  gap: calc(var(--spacing) * 4);
  padding-bottom: calc(var(--spacing) * 3);
  scroll-padding-inline: 0.1rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.landing-app-collection__rail::-webkit-scrollbar {
  display: none;
}

.landing-app-collection__card {
  min-width: 0;
  height: 100%;
  scroll-snap-align: start;
}

.landing-app-collection__card :deep(> div) {
  height: 100%;
}

.landing-app-collection__media {
  position: relative;
  display: grid;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 4);
  background:
    radial-gradient(circle at 70% 20%, color-mix(in srgb, var(--ui-primary) 22%, transparent), transparent 45%),
    var(--ui-bg-elevated);
  color: var(--ui-primary);
  font-size: 2.5rem;
}

.landing-app-collection__media > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-app-collection__card:hover .landing-app-collection__media > img {
  transform: scale(1.035);
}

.landing-app-collection__identity {
  position: absolute;
  right: calc(var(--spacing) * 3);
  bottom: calc(var(--spacing) * 3);
  left: calc(var(--spacing) * 3);
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  align-items: end;
}

.landing-app-collection__body {
  display: grid;
  gap: calc(var(--spacing) * 4);
  align-content: start;
  min-height: 12rem;
}

.landing-app-collection__body > div {
  display: grid;
  gap: calc(var(--spacing) * 1);
}

.landing-app-collection__body > div > p {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.landing-app-collection__body h3 {
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: 850;
  letter-spacing: var(--tracking-tight);
}

.landing-app-collection__body > p {
  display: -webkit-box;
  overflow: hidden;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.landing-app-collection__body > span {
  display: inline-flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  align-self: end;
  color: var(--ui-primary);
  font-size: var(--text-sm);
  font-weight: 750;
}

@media (min-width: 640px) {
  .landing-app-collection {
    gap: clamp(calc(var(--spacing) * 10), 5vw, calc(var(--spacing) * 18));
  }

  .landing-app-collection__heading h2 {
    font-size: clamp(2.5rem, 5.6vw, 5rem);
  }

  .landing-app-collection__heading > div:last-child > p {
    font-size: 1.03rem;
    line-height: 1.75;
  }

  .landing-app-collection__heading :deep(a) {
    justify-content: normal;
    width: fit-content;
    min-height: 0;
  }
}

@media (min-width: 768px) {
  .landing-app-collection__heading {
    grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 0.75fr);
  }

  .landing-app-collection__rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-columns: auto;
    grid-auto-flow: row;
    overflow-x: visible;
    padding-bottom: 0;
    scroll-snap-type: none;
  }

  .landing-app-collection__card {
    scroll-snap-align: none;
  }
}

@media (min-width: 1024px) {
  .landing-app-collection__rail {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-app-collection__media > img {
    transition: none;
  }
}
</style>
