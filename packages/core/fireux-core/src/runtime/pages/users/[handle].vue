<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[handle].vue -->
<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: distinguish missing User detail from read failure. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: render canonical biography on public User detail. -->
<!-- Concurrent edit — 2026-07-22 15:55 CEST — User access badge pass: show the signed-in user's private derived tier without publishing it in the public DTO. -->
<!-- Concurrent edit — 2026-07-22 16:02 CEST — Public profile presentation: compose canonical User identity as a polished specialist-profile hub. -->
<template>
  <UPage>
    <UPageBody class="pagebody">
      <div v-if="pending && !displayProfile" class="space-y-4">
        <USkeleton class="h-48 rounded-3xl" />
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <USkeleton v-for="index in 4" :key="index" class="h-36 rounded-2xl" />
        </div>
      </div>

      <UserPublicProfile
        v-else-if="displayProfile"
        :user-id="displayProfile.id"
        :avatar-url="
          String(displayProfile.avatar || displayProfile.image || '').trim()
        "
        :display-name="pageTitle"
        :handle="pageHeadline"
        :bio="String(displayProfile.bio || '').trim()"
        :profiles="displayProfile.profiles || []"
        :is-self="isSelf"
        :access-tier="isSelf ? accessTier : null"
      />

      <UPageCard
        v-else-if="fetchFailed"
        title="Profile unavailable"
        description="This profile could not be loaded right now."
        icon="i-lucide-cloud-alert"
        variant="subtle"
      >
        <template #footer>
          <UButton
            to="/users"
            label="Browse people"
            color="neutral"
            variant="soft"
          />
        </template>
      </UPageCard>

      <UPageCard
        v-else-if="missing"
        title="User not found"
        description="This user does not exist."
        icon="i-lucide-user-round-x"
        variant="subtle"
      >
        <template #footer>
          <UButton
            to="/users"
            label="Browse people"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UPageCard>

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

const { user: sessionUser, accessTier } = useUser()
const liveSelfProfile = computed<PublicUserDto | null>(() => {
  const user = sessionUser.value
  if (!user) return null

  const userHandle = String(user.handle || '')
    .trim()
    .toLowerCase()
  if (!userHandle || userHandle !== handle.value) return null

  const displayName = String(user.display_name || '').trim() || `@${userHandle}`
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
    accessTier: isSelf.value ? accessTier.value : null,
  },
}))
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

const displayName = computed(
  () => displayProfile.value?.displayName || displayProfile.value?.title || null
)
const pageTitle = computed(
  () => displayName.value ?? (handle.value ? `@${handle.value}` : 'User')
)
const pageHeadline = computed(() =>
  handle.value ? `@${handle.value}` : 'User profile'
)
const pageDescription = computed(
  () =>
    displayProfile.value?.description ||
    (displayName.value ? `Profile for ${displayName.value}.` : 'User profile.')
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
  String(
    displayProfile.value?.path ||
      `/users/${encodeURIComponent(handle.value || '')}`
  ).trim()
)
const canonicalUrl = computed(() =>
  siteUrl.value
    ? `${siteUrl.value}${canonicalPath.value.startsWith('/') ? canonicalPath.value : `/${canonicalPath.value}`}`
    : canonicalPath.value
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
