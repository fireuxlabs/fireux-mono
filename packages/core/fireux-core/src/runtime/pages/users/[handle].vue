<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[handle].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="isSelf"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-pencil"
          to="/dashboard/user-profile"
        >
          Edit
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody">
      <UserCardsProfile
        v-if="userCard"
        v-bind="userCard"
        :user="{ id: profile?.id || '' }"
        :show-details="false"
      />
      <UAlert
        v-else-if="fetchFailed"
        color="warning"
        title="Profile unavailable"
        description="This public profile could not be loaded right now."
      />
      <UAlert
        v-else-if="missing"
        color="amber"
        title="User not found"
        description="This handle does not exist or is not public."
      />
      <DevJson
        v-if="isDev && profile"
        :title="'Public User DTO'"
        context="User public page · users/[handle] · endpoint-first SSR"
        :data="profile"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useAsyncData, useHead, useRuntimeConfig, useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const route = useRoute()
const runtime = useRuntimeConfig()
const { appName } = useFireUXConfig()

const handle = computed(() => {
  const raw = Array.isArray(route.params.handle)
    ? route.params.handle[0]
    : route.params.handle
  return String(raw ?? '').trim().toLowerCase()
})

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

const { data, pending, error } = await useAsyncData(
  () => `public-user-${handle.value || 'unknown'}`,
  async () => {
    if (!handle.value) return { user: null as PublicUserDto | null }
    return $fetch<{ user?: PublicUserDto; item?: PublicUserDto }>(
      `/api/public/users/${encodeURIComponent(handle.value)}`
    )
  },
  {
    server: true,
    watch: [handle],
    default: () => ({ user: null }),
  }
)

const profile = computed<PublicUserDto | null>(() => {
  const payload = data.value
  if (payload?.user) return payload.user
  if (payload?.item) return payload.item
  return null
})

const { user: sessionUser } = useUser()
const userCard = computed(() => {
  const value = profile.value
  if (!value) return null
  const profiles = Array.isArray(value.profiles) ? value.profiles : []

  return {
    avatarUrl: String(value.avatar || value.image || '').trim(),
    displayName: String(value.displayName || value.title || '').trim(),
    handle: value.handle ? `@${value.handle}` : '',
    badges: profiles,
    bio: String(value.bio || value.description || '').trim(),
    profiles,
    appsLabel: '',
  }
})

const statusCode = computed(() =>
  Number((error.value as any)?.statusCode || (error.value as any)?.status || 0)
)
const missing = computed(() => statusCode.value === 404 || (!pending.value && !profile.value))
const fetchFailed = computed(() => statusCode.value >= 500)
const isSelf = computed(() =>
  Boolean(profile.value?.handle && sessionUser.value?.handle === profile.value.handle)
)

const displayName = computed(() => profile.value?.displayName || profile.value?.title || null)
const pageTitle = computed(() =>
  displayName.value ?? (handle.value ? `@${handle.value}` : 'User')
)
const pageDescription = computed(() =>
  profile.value?.description ||
  (displayName.value
    ? `Public profile for ${displayName.value}.`
    : 'Public user profile.')
)
const isDev = import.meta.dev

const headTitle = computed(() =>
  displayName.value ? `${displayName.value} | ${appName}` : `User | ${appName}`
)

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

const siteUrl = computed(() => {
  const fireux = (runtime.public as any)?.fireux || {}
  return (
    normalizeSiteUrl(fireux?.seo?.siteUrl) ||
    normalizeSiteUrl(fireux?.siteUrl) ||
    normalizeSiteUrl(fireux?.domain)
  )
})
const canonicalPath = computed(() =>
  String(profile.value?.path || `/users/${encodeURIComponent(handle.value || '')}`).trim()
)
const canonicalUrl = computed(() =>
  siteUrl.value ? `${siteUrl.value}${canonicalPath.value.startsWith('/') ? canonicalPath.value : `/${canonicalPath.value}`}` : canonicalPath.value
)

useSeoMeta({
  title: () => headTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => headTitle.value,
  ogDescription: () => pageDescription.value,
  robots: () => (missing.value ? 'noindex, nofollow' : 'index, follow'),
})

useHead(() => ({
  title: headTitle.value,
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))
</script>
