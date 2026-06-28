<template>
  <article class="rounded-lg border border-default bg-default p-4">
    <div class="flex min-w-0 items-start gap-4">
      <UAvatar
        :src="logoSrc || undefined"
        :text="avatarText || undefined"
        :alt="displayName || 'App logo'"
        size="xl"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-lg font-semibold text-default">
              {{ displayName || 'Untitled app' }}
            </h2>
            <p v-if="tagline" class="text-sm text-dimmed">
              {{ tagline }}
            </p>
          </div>

          <div v-if="badgesResolved.length" class="flex flex-wrap gap-1.5">
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

        <p class="line-clamp-3 text-sm leading-6 text-toned">
          {{ descriptionResolved }}
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <UButton
        v-if="to"
        :to="to"
        size="sm"
        color="primary"
        variant="soft"
        trailing-icon="i-lucide-arrow-right"
      >
        Case study
      </UButton>

      <UButton
        v-if="primaryWebsite"
        :to="primaryWebsite"
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-external-link"
      >
        Visit app
      </UButton>

      <UBadge
        v-else
        color="neutral"
        variant="subtle"
        size="sm"
      >
        Visit link pending
      </UBadge>

      <span
        v-if="typeof userCount === 'number'"
        class="ml-auto text-xs text-dimmed"
      >
        {{ userCount }} users
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppCard } from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

defineOptions({ inheritAttrs: false })

type Props = Partial<
  Pick<
    AppCard.Card,
    | 'to'
    | 'logoUrl'
    | 'thumbnailUrl'
    | 'avatarText'
    | 'displayName'
    | 'tagline'
    | 'description'
    | 'summary'
    | 'shortBio'
    | 'badges'
    | 'role'
    | 'ecosystem'
    | 'userCount'
    | 'socialLinks'
  >
>

const props = withDefaults(defineProps<Props>(), {
  to: '',
  logoUrl: '',
  thumbnailUrl: '',
  avatarText: '',
  displayName: '',
  tagline: '',
  description: '',
  summary: '',
  shortBio: '',
  badges: () => [],
  role: '',
  ecosystem: '',
  userCount: 0,
  socialLinks: () => ({
    website: '',
    twitter: '',
    github: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    youtube: '',
    email: '',
  }),
})

const logoSrc = computed(() =>
  String(props.logoUrl || props.thumbnailUrl || '').trim()
)

const primaryWebsite = computed(() =>
  String(props.socialLinks?.website || '').trim()
)

const badgesResolved = computed(() =>
  Array.from(
    new Set(
      [
        ...(props.badges || []),
        props.role,
        props.ecosystem,
      ]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  )
)

const descriptionResolved = computed(() =>
  String(
    props.description ||
      props.shortBio ||
      props.summary ||
      props.tagline ||
      'Public app profile, launch link, and case-study notes are being prepared.'
  )
)
</script>
