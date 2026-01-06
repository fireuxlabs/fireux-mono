<template>
  <UCard class="fx-card fx-card--profile">
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <UAvatar :src="avatar || undefined" :alt="title" size="md" />

          <div class="min-w-0">
            <div class="truncate text-lg font-semibold leading-6">{{ title }}</div>
          </div>
        </div>

        <div class="shrink-0">
          <AppBrandWordmark
            v-if="wordmarkLight || wordmarkDark || wordmark"
            size="small"
            :light-src="wordmarkLight"
            :dark-src="wordmarkDark"
          />
        </div>
      </div>
    </template>

    <div class="space-y-5">
      <div class="space-y-2">
        <div class="text-sm text-dimmed">
          <span v-if="subtitle">{{ subtitle }}</span>
          <span v-else class="italic">missing</span>
        </div>

        <div v-if="tagline" class="text-sm text-dimmed line-clamp-2">
          {{ tagline }}
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UBadge v-if="role" variant="subtle" color="neutral" size="xs">
            {{ role }}
          </UBadge>
          <UBadge v-if="shortName" variant="subtle" color="neutral" size="xs">
            @{{ shortName }}
          </UBadge>
          <UBadge
            v-if="typeof userCount === 'number'"
            variant="subtle"
            color="neutral"
            size="xs"
          >
            {{ userCount }} users
          </UBadge>

          <UBadge
            v-for="badge in badges"
            :key="badge"
            variant="subtle"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>
          <span v-if="id" class="text-xs text-dimmed font-mono">
            {{ id }}
          </span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Description</div>
        <div class="text-sm">
          <span v-if="app?.description">{{ app.description }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="rounded border p-4 space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">App ID</div>
          <div class="text-sm font-mono">
            <span v-if="app?.id">{{ app.id }}</span>
            <span v-else class="text-dimmed">missing</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Ecosystem</div>
          <div class="text-sm">
            <span v-if="app?.ecosystem">{{ app.ecosystem }}</span>
            <span v-else class="text-dimmed">missing</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Socials</div>
          <div class="flex flex-wrap justify-end gap-2">
            <a
              v-for="link in socialLinkItems"
              :key="link.platform"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center"
              :title="link.platform"
              :aria-label="link.platform"
            >
              <Icon
                :name="iconForPlatform(link.platform)"
                mode="svg"
                class="size-5"
              />
            </a>
            <span v-if="!socialLinkItems.length" class="text-sm text-dimmed italic">
              missing
            </span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import AppBrandWordmark from '../../../App/Brand/Wordmark.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<
  { app?: App | null } &
    Pick<
      AppCard.Card,
      | 'id'
      | 'shortName'
      | 'role'
      | 'userCount'
      | 'tagline'
      | 'wordmark'
      | 'wordmarkLight'
      | 'wordmarkDark'
      | 'avatar'
      | 'title'
      | 'subtitle'
      | 'badges'
    >
>()

const {
  app,
  id,
  shortName,
  role,
  userCount,
  tagline,
  wordmark,
  wordmarkLight,
  wordmarkDark,
  avatar,
  title,
  subtitle,
} = toRefs(props)

const socialLinkItems = computed(() => {
  const socials = app.value?.social_links || {}
  return Object.entries(socials)
    .map(([platform, raw]) => {
      const value = (raw || '').trim()
      if (!value) return null

      if (/^https?:\/\//i.test(value)) {
        return { platform, url: value }
      }

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
      const suffix = value.replace(/^\/+/, '')
      return { platform, url: `${prefix}${suffix}` }
    })
    .filter((item): item is { platform: string; url: string } => Boolean(item))
})

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
</script>
