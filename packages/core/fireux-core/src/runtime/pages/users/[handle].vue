<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[handle].vue -->
<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: distinguish missing User detail from read failure. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: render canonical biography on public User detail. -->
<template>
  <UPage>
    <UPageHeader :headline="pageHeadline" :title="pageTitle">
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
        :show-footer="false"
      />
      <UAlert
        v-else-if="fetchFailed"
        color="warning"
        title="Profile unavailable"
        description="This profile could not be loaded right now."
      />
      <UAlert
        v-else-if="missing"
        color="warning"
        title="User not found"
        description="This user does not exist."
      />
      <DevJson
        :title="'User DTO'"
        context="User page · users/[handle] · endpoint-first SSR"
        :data="devJsonData"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import {
  setResponseStatus,
  useAsyncData,
  useHead,
  useRuntimeConfig,
  useSeoMeta,
} from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useRouteParam } from '../../composables/shared/useRouteParam'

const runtime = useRuntimeConfig()
const { appName } = useFireUXConfig()

const routeHandle = useRouteParam('handle')
const handle = computed(() => routeHandle.value.toLowerCase())

type PublicUserDto = {
  id: string
  handle: string
  displayName: string
  bio: string
  avatar?: string
  apps?: string[]
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
const liveSelfProfile = computed<PublicUserDto | null>(() => {
  const user = sessionUser.value
  if (!user) return null

  const userHandle = String(user.handle || '').trim().toLowerCase()
  if (!userHandle || userHandle !== handle.value) return null

  const displayName =
    String(user.display_name || '').trim() ||
    `@${userHandle}`
  const apps = Array.isArray(user.app_ids) ? user.app_ids : []
  const profiles = Array.isArray(user.profiles) ? user.profiles : []
  const avatar = String(user.avatar || '').trim()
  const bio = String(user.bio || '').trim()

  // Public detail family: SSR uses the public DTO; a signed-in user can then
  // hydrate their own profile from the live auth-bound User document.
  return {
    id: String(user.id || '').trim(),
    handle: userHandle,
    displayName,
    bio,
    avatar,
    apps,
    profiles,
    title: displayName,
    description: bio || `Public profile for ${displayName}.`,
    path: `/users/${encodeURIComponent(userHandle)}`,
    image: avatar || undefined,
    updatedAt: '',
    isPublic: true,
  }
})
const displayProfile = computed(() => liveSelfProfile.value ?? profile.value)
const devJsonData = computed(() => ({
  objects: {
    endpointProfile: profile.value,
    liveSelfProfile: liveSelfProfile.value,
    displayProfile: displayProfile.value,
  },
  derived: {
    source: liveSelfProfile.value ? 'live-self-user-doc' : 'public-user-api',
    handle: handle.value,
    isSelf: isSelf.value,
  },
}))
const userCard = computed(() => {
  const value = displayProfile.value
  if (!value) return null
  const profiles = Array.isArray(value.profiles) ? value.profiles : []

  return {
    id: value.id,
    to: value.path || `/users/${encodeURIComponent(value.handle || '')}`,
    avatarUrl: String(value.avatar || value.image || '').trim(),
    secondaryAvatarUrl: '',
    displayName: String(value.displayName || value.title || '').trim(),
    title: '',
    summary: String(value.bio || '').trim(),
    handle: value.handle ? `@${value.handle}` : '',
    badges: profiles,
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    bio: String(value.bio || '').trim(),
    profiles,
    appsLabel: '',
  }
})

const statusCode = computed(() =>
  Number(
    (error.value as any)?.statusCode ||
      (error.value as any)?.status ||
      (error.value as any)?.response?.status ||
      0
  )
)
const missing = computed(
  () =>
    statusCode.value === 404 ||
    (!pending.value && !error.value && !profile.value)
)
const fetchFailed = computed(
  () => Boolean(error.value) && statusCode.value !== 404
)

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (fetchFailed.value) {
    setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
  }
}

const isSelf = computed(() =>
  Boolean(handle.value && sessionUser.value?.handle === handle.value)
)

const displayName = computed(() =>
  displayProfile.value?.displayName || displayProfile.value?.title || null
)
const pageTitle = computed(() =>
  displayName.value ?? (handle.value ? `@${handle.value}` : 'User')
)
const pageHeadline = computed(() =>
  handle.value ? `@${handle.value}` : 'User profile'
)
const pageDescription = computed(() =>
  displayProfile.value?.description ||
  (displayName.value
    ? `Profile for ${displayName.value}.`
    : 'User profile.')
)

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
  String(displayProfile.value?.path || `/users/${encodeURIComponent(handle.value || '')}`).trim()
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
