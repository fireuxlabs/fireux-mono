<template>
  <div v-if="card" class="space-y-6">
    <section class="overflow-hidden rounded-lg border border-default bg-default">
      <div
        v-if="heroImageUrl"
        class="app-detail-public__media bg-muted"
      >
        <img
          :src="heroImageUrl"
          :alt="`${card.displayName || 'App'} public image`"
          class="app-detail-public__image"
        />
      </div>

      <div class="space-y-5 p-5 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex min-w-0 items-start gap-4">
            <UAvatar
              :src="logoSrc || undefined"
              :text="card.avatarText || undefined"
              :alt="card.displayName || 'App logo'"
              size="xl"
              class="shrink-0"
            />

            <div class="min-w-0 space-y-2">
              <div>
                <h1 class="text-2xl font-semibold text-default">
                  {{ card.displayName || 'Untitled app' }}
                </h1>
                <p v-if="card.tagline" class="text-sm text-dimmed">
                  {{ card.tagline }}
                </p>
              </div>

              <div class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="badge in badgesResolved"
                  :key="badge"
                  color="neutral"
                  variant="soft"
                  size="xs"
                >
                  {{ badge }}
                </UBadge>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 sm:justify-end">
            <UButton
              v-if="primaryWebsite"
              :to="primaryWebsite"
              target="_blank"
              rel="noopener noreferrer"
              icon="i-lucide-external-link"
              color="primary"
            >
              Visit app
            </UButton>
            <UButton
              to="/apps"
              color="neutral"
              variant="soft"
              icon="i-lucide-arrow-left"
            >
              All apps
            </UButton>
          </div>
        </div>

        <p class="max-w-3xl text-sm leading-6 text-toned">
          {{ overviewText }}
        </p>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3" aria-label="App case study">
      <UPageCard
        v-for="item in caseStudyItems"
        :key="item.title"
        :title="item.title"
        :description="item.description"
        variant="subtle"
      />
    </section>

    <section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <UPageCard title="About this app" variant="subtle">
        <p class="text-sm leading-6 text-toned">
          {{ aboutText }}
        </p>
      </UPageCard>

      <UPageCard title="Launch links" variant="subtle">
        <div v-if="socialItems.length" class="flex flex-wrap gap-2">
          <UButton
            v-for="item in socialItems"
            :key="item.platform"
            :to="item.url"
            target="_blank"
            rel="noopener noreferrer"
            :icon="item.icon"
            color="neutral"
            variant="soft"
            size="sm"
          >
            {{ item.platform }}
          </UButton>
        </div>
        <p v-else class="text-sm italic text-dimmed">
          No public launch links have been published yet.
        </p>
      </UPageCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useSocialLinks,
  type SocialLinks,
} from '../../../composables/fireux/app/ui/useSocialLinks'
import { useAppInterface } from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { App } from '../../../models/core/app.model'

const props = defineProps<{
  app: App
}>()

const appRef = computed(() => props.app)
const { profile: toProfile } = useAppInterface(appRef)
const { toItems } = useSocialLinks()

const card = computed(() => toProfile(props.app))
const logoSrc = computed(() =>
  String(card.value?.logoUrl || card.value?.thumbnailUrl || '').trim()
)
const heroImageUrl = computed(() =>
  String(card.value?.coverUrl || card.value?.thumbnailUrl || card.value?.logoUrl || '').trim()
)
const primaryWebsite = computed(() =>
  String(card.value?.socialLinks?.website || '').trim()
)
const socialItems = computed(() =>
  toItems((card.value?.socialLinks ?? {}) as SocialLinks)
)
const badgesResolved = computed(() =>
  Array.from(
    new Set(
      [
        ...(card.value?.badges || []),
        card.value?.role,
        card.value?.ecosystem,
        card.value?.status,
      ]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  )
)
const overviewText = computed(() =>
  String(
    card.value?.description ||
      card.value?.shortBio ||
      card.value?.summary ||
      card.value?.tagline ||
      'This public app profile is being prepared.'
  )
)
const aboutText = computed(() =>
  String(
    card.value?.longBio ||
      card.value?.shortBio ||
      card.value?.description ||
      'Public case-study copy has not been published yet.'
  )
)
const caseStudyItems = computed(() => [
  {
    title: 'Public role',
    description:
      card.value?.role
        ? `${card.value.displayName} is published as a ${card.value.role} app.`
        : 'The app role has not been published yet.',
  },
  {
    title: 'Ecosystem fit',
    description:
      card.value?.ecosystem
        ? `Part of the ${card.value.ecosystem} ecosystem.`
        : 'The ecosystem link has not been published yet.',
  },
  {
    title: 'Launch path',
    description: primaryWebsite.value
      ? `Public launch link: ${primaryWebsite.value}`
      : 'A public launch link is still pending.',
  },
])
</script>

<style scoped>
.app-detail-public__media {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 20rem;
  padding: 1.5rem;
}

.app-detail-public__image {
  max-height: 17rem;
  max-width: 100%;
  object-fit: contain;
}
</style>
