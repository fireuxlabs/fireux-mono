<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Users"
      description="Platform user index for public FireUX profiles."
    />

    <UPageBody class="pagebody space-y-6">
      <UAlert
        v-if="fetchError"
        color="warning"
        variant="subtle"
        title="Users service unavailable"
        description="Public users could not be loaded from the server endpoint."
      />

      <UCard v-if="isDev">
        <DevJson
          title="Public Users (dev)"
          context="Users index · endpoint-first SSR payload"
          :data="usersDto"
          :default-open="false"
        />
      </UCard>

      <EntityIndexCta
        title="Users index"
        description="Browse public FireUX profiles, move into account surfaces, and use the learn-more guide as the canonical public explanation."
        source="GET /api/public/users"
        :count-label="`${collection.length} public profile${collection.length === 1 ? '' : 's'}`"
        :actions="actions"
      />

      <UserCTA />
      <UserCollectionManager :collection="collection" />

      <UAlert
        v-if="!collection.length"
        color="neutral"
        variant="subtle"
        title="No public users yet"
        description="Public profiles will appear here when users publish a handle."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useHead, useRuntimeConfig, useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { User } from 'fireux-core/runtime/models/core/user.model'

definePageMeta({
  nav: {
    key: 'users',
    label: 'Users',
    icon: 'i-lucide-users',
    order: 50,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Users',
  description: 'Browse users.',
  layout: 'default',
  name: 'FireuxUsersIndexPage',
})

const { appName } = useFireUXConfig()
const runtime = useRuntimeConfig()

type PublicUserDto = {
  id: string
  handle: string
  displayName: string
  avatar?: string
  bio?: string
  profiles?: string[]
  title: string
  description: string
  path: string
  image?: string
  updatedAt: string
  isPublic: boolean
}

const { data, error } = await useAsyncData(
  'public-users-index',
  () => $fetch<{ users?: PublicUserDto[]; items?: PublicUserDto[] }>('/api/public/users'),
  {
    server: true,
    default: () => ({ users: [] }),
  }
)

const usersDto = computed<PublicUserDto[]>(() => {
  const payload = data.value
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(payload?.items)) return payload.items
  return []
})

function asUser(dto: PublicUserDto): User {
  return {
    id: dto.id,
    display_name: dto.displayName || dto.title,
    avatar: String(dto.avatar || dto.image || '').trim(),
    handle: dto.handle,
    email: '',
    bio: String(dto.bio || dto.description || '').trim(),
    profiles: Array.isArray(dto.profiles) ? dto.profiles : [],
    userOf: [],
    adminOf: [],
    notifications: [],
    created: {
      at: null as any,
      by: undefined,
    },
    updated: {
      at: dto.updatedAt as any,
      by: undefined,
    },
  }
}

const collection = computed<User[]>(() => usersDto.value.map(asUser))
const fetchError = computed(() => Boolean(error.value))
const isDev = import.meta.dev

const actions = [
  {
    label: 'Account',
    cta: 'Open auth',
    to: '/auth',
    icon: 'i-lucide-log-in',
  },
  {
    label: 'Dashboard',
    cta: 'Open dashboard',
    to: '/dashboard',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/users/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const

function normalizeSiteUrl(input: unknown): string {
  const value = typeof input === 'string' ? input.trim() : ''
  if (!value) return ''
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    return new URL(withProtocol).origin
  } catch {
    return ''
  }
}

const canonicalUrl = computed(() => {
  const fireux = (runtime.public as any)?.fireux || {}
  const siteUrl =
    normalizeSiteUrl(fireux?.seo?.siteUrl) ||
    normalizeSiteUrl(fireux?.siteUrl) ||
    normalizeSiteUrl(fireux?.domain)
  return siteUrl ? `${siteUrl}/users` : '/users'
})

const headTitle = `${appName} | Users`
const pageDescription = 'Browse public user profiles.'

useSeoMeta({
  title: headTitle,
  description: pageDescription,
  ogTitle: headTitle,
  ogDescription: pageDescription,
  robots: 'index, follow',
})

useHead({
  title: headTitle,
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
})
</script>
