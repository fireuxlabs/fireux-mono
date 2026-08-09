<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: update ecosystem discovery copy. -->
<template>
  <UPage>
    <UPageHeader
      title="Ecosystems"
      description="Explore the product families built with FireUX and the Apps each one groups."
    >
      <template #links>
        <UButton
          to="/apps"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        >
          Browse all Apps
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="flex flex-wrap items-center gap-2">
        <UBadge color="neutral" variant="soft" size="lg">
          {{ ecosystemCountLabel }}
        </UBadge>
        <UBadge color="neutral" variant="soft" size="lg">
          {{ appCountLabel(totalAppCount) }} in Ecosystems
        </UBadge>
      </div>

      <div
        v-if="ecosystemsController.outcome.value === 'pending'"
        class="grid gap-5 md:grid-cols-2"
        aria-label="Loading Ecosystems"
      >
        <UPageCard v-for="index in 6" :key="index" variant="subtle">
          <div class="space-y-4">
            <USkeleton class="size-14 rounded-2xl" />
            <USkeleton class="h-7 w-2/5" />
            <USkeleton class="h-16 w-full" />
          </div>
        </UPageCard>
      </div>

      <UAlert
        v-else-if="ecosystemsController.outcome.value === 'error'"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="Ecosystems could not be loaded"
        description="Try loading the Ecosystem directory again."
        :actions="[
          {
            label: 'Try again',
            color: 'error',
            variant: 'soft',
            onClick: refreshEcosystems,
          },
        ]"
      />

      <div
        v-else-if="ecosystems.length"
        class="grid gap-5 md:grid-cols-2"
        aria-label="Ecosystems"
      >
        <UPageCard
          v-for="ecosystem in ecosystems"
          :key="ecosystem.id"
          :to="ecosystem.detail_url"
          variant="subtle"
          class="group h-full"
        >
          <div class="flex h-full flex-col gap-5">
            <div class="flex items-start justify-between gap-4">
              <div
                class="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-elevated text-muted"
              >
                <UIcon
                  v-if="!loadedImageIds.has(ecosystem.id)"
                  name="i-lucide-orbit"
                  class="size-7"
                  aria-hidden="true"
                />
                <img
                  v-if="ecosystem.image_url"
                  :src="ecosystem.image_url"
                  :alt="`${ecosystem.name} logo`"
                  width="56"
                  height="56"
                  loading="lazy"
                  :data-ecosystem-logo="ecosystem.id"
                  class="absolute inset-0 size-full object-contain transition-opacity"
                  :class="loadedImageIds.has(ecosystem.id) ? 'opacity-100' : 'opacity-0'"
                  @load="markImageLoaded(ecosystem.id)"
                />
              </div>
              <UBadge color="neutral" variant="soft">
                {{ appCountLabel(ecosystem.app_count) }}
              </UBadge>
            </div>

            <div class="flex flex-1 flex-col gap-3">
              <h2 class="m-0 text-2xl font-semibold text-highlighted">
                {{ ecosystem.name }}
              </h2>
              <p class="m-0 line-clamp-3 text-sm leading-6 text-muted">
                {{ ecosystem.description }}
              </p>
              <span
                class="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-medium text-primary"
              >
                Explore {{ ecosystem.name }}
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </UPageCard>
      </div>

      <MoleculesStateCard
        v-else
        entity="ecosystems"
        state="empty"
        surface="bare"
        title="No Ecosystems yet"
        description="Ecosystems will appear here when they are active."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePublishedPlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'

const ecosystemsController = usePublishedPlatformEcosystemDirectory()
const ecosystems = ecosystemsController.ecosystems
const loadedImageIds = ref(new Set<string>())
const totalAppCount = computed(() =>
  ecosystems.value.reduce(
    (total, ecosystem) => total + ecosystem.app_count,
    0
  )
)
const ecosystemCountLabel = computed(
  () =>
    `${ecosystemsController.count.value} ${ecosystemsController.count.value === 1 ? 'Ecosystem' : 'Ecosystems'}`
)
const appCountLabel = (count: number) =>
  `${count} ${count === 1 ? 'App' : 'Apps'}`
const refreshEcosystems = async () => {
  await ecosystemsController.refresh?.()
}
const markImageLoaded = (ecosystemId: string) => {
  loadedImageIds.value = new Set([
    ...loadedImageIds.value,
    ecosystemId,
  ])
}

onMounted(async () => {
  await nextTick()
  for (const image of document.querySelectorAll<HTMLImageElement>(
    '[data-ecosystem-logo]'
  )) {
    const ecosystemId = image.dataset.ecosystemLogo
    if (!ecosystemId) continue
    if (image.complete && image.naturalWidth > 0) {
      markImageLoaded(ecosystemId)
      continue
    }
    image.addEventListener('load', () => markImageLoaded(ecosystemId), {
      once: true,
    })
  }
})

definePageMeta({
  tag: 'ecosystems',
  nav: {
    key: 'ecosystems',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Ecosystems',
  description: 'Browse published FireUX ecosystems.',
  layout: 'default',
  name: 'EcosystemsIndexPage',
})

useSeo({
  title: 'FireUX Ecosystems',
  description: 'Browse published FireUX ecosystems and their connected Apps.',
  path: '/ecosystems',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: ecosystemsController.ecosystems.value.map((ecosystem) => ({
        name: ecosystem.name,
        url: context.absoluteUrl(ecosystem.detail_url),
      })),
    }),
})
</script>
