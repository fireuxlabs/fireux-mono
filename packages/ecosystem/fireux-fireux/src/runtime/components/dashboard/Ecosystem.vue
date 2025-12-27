<template>
  <div class="grid grid-cols-1 gap-4">
    <UPageCard variant="subtle">
      <p class="text-xs text-dimmed mb-2">Component: DashboardEcosystem (fireux-fireux)</p>
      <h1 class="text-xl font-semibold">FireUX Stuff</h1>

      <div class="mt-3 space-y-3">
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
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { App } from 'fireux-core/runtime/models/core/app.model'

const { user, pending } = useUser()
const { getProxiedAvatarUrl } = useAvatarProxy()
const { firestoreFetchCollection } = useFirestoreRead()
const appsRef = firestoreFetchCollection<App>('apps')

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

const appInitials = (app: App) => {
  const label =
    (app.app_short_name ?? '').trim() ||
    (app.app_name ?? '').trim() ||
    (app.id ?? '').trim()
  return label ? initials(label) : ''
}

const userAppLogoUrl = (app: App): string => {
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
    (typeof entry?.avatar_url === 'string' && entry.avatar_url) ||
    (typeof entry?.logo_url === 'string' && entry.logo_url) ||
    (typeof entry?.wordmark_url === 'string' && entry.wordmark_url) ||
    (typeof entry?.icon_url === 'string' && entry.icon_url) ||
    (typeof entry?.avatarUrl === 'string' && entry.avatarUrl) ||
    (typeof entry?.logoUrl === 'string' && entry.logoUrl) ||
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

  // Fallback to the standard membership arrays when user.apps isn't present.
  const anyUser = user.value as any
  ids.push(...(((anyUser?.userOf ?? []) as any[]) || []).map((v) => (v ?? '').toString().trim()))
  ids.push(...(((anyUser?.adminOf ?? []) as any[]) || []).map((v) => (v ?? '').toString().trim()))

  return Array.from(new Set(ids.filter(Boolean)))
})

const apps = computed<App[]>(() => {
  if (!appIds.value.length) return []
  const idSet = new Set(appIds.value)
  return (appsRef.value ?? [])
    .filter((app): app is App => Boolean(app?.id) && idSet.has(app.id))
    .slice()
    .sort((a, b) => (a.app_name || '').localeCompare(b.app_name || ''))
})

const avatarSrc = (app: App) => {
  const raw =
    userAppLogoUrl(app) ||
    app.avatar_url ||
    app.logo_url ||
    app.wordmark_url ||
    ''
  return getProxiedAvatarUrl(raw)
}

const appsPending = computed(() => appsRef.value === undefined)
const isLoading = computed(
  () => Boolean(pending.value) || Boolean(appsPending.value) || user.value === undefined
)
</script>
