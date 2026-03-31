<template>
  <UPageCard variant="subtle">
    <div class="space-y-3">
      <div class="space-y-1">
        <p class="text-sm font-medium">Ecosystem</p>
        <p class="text-sm text-dimmed">Your world: apps and memberships</p>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-dimmed">My apps</p>
          <UBadge v-if="apps.length" color="neutral" variant="soft">
            {{ apps.length }}
          </UBadge>
        </div>

        <div v-if="isLoading" class="flex flex-wrap gap-2">
          <USkeleton class="h-10 w-10 rounded-full" />
          <USkeleton class="h-10 w-10 rounded-full" />
          <USkeleton class="h-10 w-10 rounded-full" />
        </div>

        <div v-else-if="apps.length" class="flex flex-wrap gap-2">
          <UAvatar
            v-for="app in apps"
            :key="app.id"
            :src="avatarSrc(app)"
            :alt="app.app_name"
            :text="appInitials(app)"
            size="sm"
          />
        </div>

        <p v-else class="text-sm text-dimmed">
          No apps yet.
        </p>
      </div>

      <div class="flex">
        <UButton to="/apps" label="Browse apps" color="neutral" size="sm" />
      </div>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAvatarProxy } from '../../../composables/fireux/app/ui/useAvatarProxy'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { resolveAppMediaForView } from '../../../composables/fireux/firestore/core/app/utils/appMedia'
import { useFirestoreRead } from '../../../composables/fireux/firestore/operations/useFirestoreRead'
import type { AppModel } from '../../../models/core/app.model'

const { user, pending } = useUser()
const { getProxiedAvatarUrl } = useAvatarProxy()
const { firestoreFetchCollection } = useFirestoreRead()
const appsRef = firestoreFetchCollection<AppModel>('apps')

type UserAppsValue = Record<string, unknown> | Array<unknown> | null

const userApps = computed<UserAppsValue>(() => {
  const anyUser = user.value as unknown as Record<string, unknown> | null
  const raw = anyUser?.['apps']

  if (!raw) return null
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object') return raw as Record<string, unknown>
  return null
})

const initials = (value: string) =>
  value
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const appInitials = (app: AppModel) => {
  const label =
    (app.app_short_name ?? '').trim() ||
    (app.app_name ?? '').trim() ||
    (app.id ?? '').trim()
  return label ? initials(label) : ''
}

const userAppLogoUrl = (app: AppModel): string => {
  const appsValue = userApps.value
  if (!appsValue) return ''

  const appId = (app.id ?? '').toString().trim()
  if (!appId) return ''

  let entry: any = null
  if (Array.isArray(appsValue)) {
    entry = (appsValue as any[]).find((candidate) => {
      const id =
        candidate?.id ??
        candidate?.app_id ??
        candidate?.appId ??
        candidate?.appID ??
        ''
      return (id ?? '').toString().trim() === appId
    })
  } else {
    entry = (appsValue as Record<string, any>)[appId]
  }

  const rawUrl =
    (typeof entry?.media?.thumbnail_url === 'string' && entry.media.thumbnail_url) ||
    (typeof entry?.media?.logo_url === 'string' && entry.media.logo_url) ||
    (typeof entry?.media?.wordmark_light_url === 'string' && entry.media.wordmark_light_url) ||
    (typeof entry?.media?.wordmark_dark_url === 'string' && entry.media.wordmark_dark_url) ||
    (typeof (entry as any)?.thumbnail_url === 'string' && (entry as any).thumbnail_url) ||
    (typeof entry?.avatar_url === 'string' && entry.avatar_url) ||
    (typeof entry?.logo_url === 'string' && entry.logo_url) ||
    (typeof entry?.wordmark_light_url === 'string' && entry.wordmark_light_url) ||
    (typeof entry?.wordmark_dark_url === 'string' && entry.wordmark_dark_url) ||
    (typeof entry?.icon_url === 'string' && entry.icon_url) ||
    (typeof entry?.avatarUrl === 'string' && entry.avatarUrl) ||
    (typeof entry?.logoUrl === 'string' && entry.logoUrl) ||
    (typeof entry?.wordmarkLightUrl === 'string' && entry.wordmarkLightUrl) ||
    (typeof entry?.wordmarkDarkUrl === 'string' && entry.wordmarkDarkUrl) ||
    (typeof entry?.wordmarkUrl === 'string' && entry.wordmarkUrl) ||
    (typeof entry?.iconUrl === 'string' && entry.iconUrl) ||
    (typeof entry?.avatar === 'string' && entry.avatar) ||
    (typeof entry?.logo === 'string' && entry.logo) ||
    (typeof entry?.wordmark === 'string' && entry.wordmark) ||
    (typeof entry?.icon === 'string' && entry.icon) ||
    ''

  return rawUrl.trim()
}

const appIds = computed(() => {
  const ids: string[] = []

  const appsValue = userApps.value
  if (Array.isArray(appsValue)) {
    for (const entry of appsValue as any[]) {
      if (typeof entry === 'string') {
        const v = entry.trim()
        if (v) ids.push(v)
        continue
      }
      const v = (entry?.id ?? entry?.app_id ?? entry?.appId ?? '').toString().trim()
      if (v) ids.push(v)
    }
  } else if (appsValue && typeof appsValue === 'object') {
    ids.push(...Object.keys(appsValue).map((k) => k.trim()).filter(Boolean))
  }

  const anyUser = user.value as any
  ids.push(...(((anyUser?.userOf ?? []) as any[]) || []).map((v) => (v ?? '').toString().trim()))
  ids.push(...(((anyUser?.adminOf ?? []) as any[]) || []).map((v) => (v ?? '').toString().trim()))

  return Array.from(new Set(ids.filter(Boolean)))
})

const apps = computed<AppModel[]>(() => {
  if (!appIds.value.length) return []
  const idSet = new Set(appIds.value)
  return (appsRef.value ?? [])
    .filter((app): app is App => Boolean(app?.id) && idSet.has(app.id))
    .slice()
    .sort((a, b) => (a.app_name || '').localeCompare(b.app_name || ''))
})

const avatarSrc = (app: AppModel) => {
  const resolvedMedia = resolveAppMediaForView((app as any)?.media, {
    devLocalFallback: import.meta.dev,
  })
  const raw =
    userAppLogoUrl(app) ||
    resolvedMedia.thumbnailUrl ||
    resolvedMedia.logoUrl ||
    resolvedMedia.wordmarkLightUrl ||
    resolvedMedia.wordmarkDarkUrl ||
    (app as any).avatar_url ||
    (app as any).logo_url ||
    (app as any).wordmark_light_url ||
    (app as any).wordmark_dark_url ||
    ''
  return getProxiedAvatarUrl(raw)
}

const appsPending = computed(() => appsRef.value === undefined)
const isLoading = computed(
  () => Boolean(pending.value) || Boolean(appsPending.value) || user.value === undefined
)
</script>
