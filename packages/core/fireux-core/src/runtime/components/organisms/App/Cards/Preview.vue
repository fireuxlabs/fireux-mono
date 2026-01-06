<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Preview.vue -->
<template>
  <UCard class="fx-card fx-card--preview">
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <UAvatar :src="avatar || undefined" :alt="title" size="md" />

          <div class="min-w-0">
            <div class="truncate text-lg font-semibold leading-6">{{ title }}</div>
          </div>
        </div>

        <div v-if="showWordmark && (wordmarkLight || wordmarkDark || wordmark)" class="shrink-0">
          <AppBrandWordmark
            size="small"
            :light-src="wordmarkLight"
            :dark-src="wordmarkDark"
          />
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <div v-if="showSubtitle && subtitle" class="text-sm text-dimmed truncate">
        {{ subtitle }}
      </div>

      <div v-if="showBadges && badges.length" class="flex flex-wrap gap-2">
        <UBadge
          v-for="badge in badges"
          :key="badge"
          variant="soft"
          color="neutral"
          size="xs"
        >
          {{ badge }}
        </UBadge>
      </div>

      <div v-if="showTagline && tagline" class="text-sm text-dimmed line-clamp-2">
        {{ tagline }}
      </div>

      <div v-if="showMeta" class="flex flex-wrap items-center gap-2">
        <div v-if="shortName" class="text-xs text-dimmed">
          <span class="font-mono">@{{ shortName }}</span>
        </div>

        <div v-if="id" class="text-xs text-dimmed">
          <span class="font-mono">{{ id }}</span>
        </div>

        <UBadge
          v-if="userCount !== null"
          variant="soft"
          color="neutral"
          size="xs"
          class="inline-flex items-center gap-1"
        >
          <UIcon name="i-lucide-users" class="size-3 shrink-0" />
          <span class="truncate">{{ userCount }}</span>
        </UBadge>
      </div>

      <div v-if="showSocials && socialIconItems.length" class="flex flex-wrap items-center gap-2">
        <a
          v-for="item in socialIconItems"
          :key="item.platform"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center"
          :title="item.platform"
          :aria-label="item.platform"
        >
          <Icon :name="item.icon" mode="svg" class="size-5" />
        </a>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import AppBrandWordmark from '../../../App/Brand/Wordmark.vue'

const props = withDefaults(
  defineProps<
    Pick<
      AppCard.Card,
      | 'id'
      | 'shortName'
      | 'avatar'
      | 'title'
      | 'subtitle'
      | 'badges'
      | 'tagline'
      | 'userCount'
      | 'wordmark'
      | 'wordmarkLight'
      | 'wordmarkDark'
      | 'socialLinks'
    > & {
      showSubtitle?: boolean
      showBadges?: boolean
      showTagline?: boolean
      showMeta?: boolean
      showWordmark?: boolean
      showSocials?: boolean
    }
  >(),
  {
    showSubtitle: true,
    showBadges: true,
    showTagline: true,
    showMeta: true,
    showWordmark: true,
    showSocials: true,
  }
)

const iconForPlatform = (platform: string) => {
  const map: Record<string, string> = {
    website: 'heroicons:globe-alt',
    twitter: 'simple-icons:x',
    linkedin: 'skill-icons:linkedin',
    github: 'skill-icons:github-dark',
    instagram: 'skill-icons:instagram',
    facebook: 'logos:facebook',
    youtube: 'logos:youtube-icon',
  }
  return map[platform] || 'heroicons:link'
}

const toSocialUrl = (platform: string, value: string) => {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const base: Record<string, string> = {
    website: 'http://',
    twitter: 'https://x.com/',
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/',
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/',
  }

  const prefix = base[platform] || ''
  const suffix = trimmed.replace(/^\/+/, '')
  return `${prefix}${suffix}`
}

const socialIconItems = computed(() => {
  const socials = props.socialLinks || {}
  return Object.entries(socials)
    .map(([platform, raw]) => {
      const url = toSocialUrl(platform, String(raw || ''))
      if (!url) return null
      return { platform, url, icon: iconForPlatform(platform) }
    })
    .filter((x): x is { platform: string; url: string; icon: string } => Boolean(x))
})
</script>