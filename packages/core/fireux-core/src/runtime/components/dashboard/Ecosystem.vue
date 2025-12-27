<template>
  <UPageCard title="Ecosystem" variant="subtle">
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

      <div v-else-if="apps.length" class="space-y-2">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="app in apps"
            :key="app.id"
            type="button"
            class="rounded-full"
            :aria-label="expandedAppId === app.id ? `Collapse ${app.app_name}` : `Open ${app.app_name}`"
            @click="toggle(app)"
          >
            <UAvatar
              :src="avatarSrc(app)"
              :alt="app.app_name"
              :text="appInitials(app)"
              size="sm"
            />
          </button>
        </div>

        <div v-if="expandedApp" class="space-y-2">
          <OrganismsAppCardsCell :app="expandedApp" />

          <div v-if="expandedInfo" class="text-sm text-dimmed">
            <span v-if="expandedInfo.package?.version">
              v{{ expandedInfo.package.version }}
            </span>
            <span v-if="expandedInfo.app?.modules?.length">
              <span v-if="expandedInfo.package?.version"> • </span>
              {{ expandedInfo.app.modules.length }} module(s)
            </span>
          </div>

          <p v-else-if="expandedInfoPending" class="text-sm text-dimmed">
            Loading app info…
          </p>

          <p v-else-if="expandedInfoError" class="text-sm text-dimmed">
            {{ expandedInfoError }}
          </p>
        </div>
      </div>

      <p v-else class="text-sm text-dimmed">No apps yet.</p>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import type { App } from '../../models/core/app.model'
import { useAvatarProxy } from '../../composables/fireux/app/ui/useAvatarProxy'

const { user, pending: userPending } = useUser()
const { firestoreFetchCollection } = useFirestoreRead()
const appsRef = firestoreFetchCollection<App>('apps')
const { getProxiedAvatarUrl } = useAvatarProxy()

type AppInfoResponse = {
  ok?: boolean
  app?: {
    id?: string
    name?: string
    shortName?: string
    ecosystem?: string
    role?: string
    modules?: string[]
  }
  package?: {
    name?: string
    version?: string
  }
}

const expandedAppId = ref<string | null>(null)
const infoByAppId = ref<Record<string, AppInfoResponse>>({})
const infoPendingByAppId = ref<Record<string, boolean>>({})
const infoErrorByAppId = ref<Record<string, string>>({})

const appIds = computed(() => {
  const ids = [
    ...((user.value?.userOf ?? []) as string[]),
    ...((user.value?.adminOf ?? []) as string[]),
  ]

  return Array.from(
    new Set(
      ids
        .map((id) => (id ?? '').toString().trim())
        .filter((id) => id.length > 0)
    )
  )
})

const apps = computed<App[]>(() => {
  if (!appIds.value.length) return []
  const idSet = new Set(appIds.value)
  return (appsRef.value ?? [])
    .filter((app): app is App => Boolean(app?.id) && idSet.has(app.id))
    .slice()
    .sort((a, b) => (a.app_name || '').localeCompare(b.app_name || ''))
})

type UserAppsValue = Record<string, unknown> | Array<unknown> | null

const userApps = computed<UserAppsValue>(() => {
  const anyUser = user.value as unknown as Record<string, unknown> | null
  const raw = anyUser?.['apps']

  if (!raw) return null
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object') return raw as Record<string, unknown>
  return null
})

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

  const trimmed = rawUrl.trim()
  return trimmed
}

const expandedApp = computed(() =>
  expandedAppId.value
    ? apps.value.find((app) => app.id === expandedAppId.value) ?? null
    : null
)

const initials = (value: string) =>
  value
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const appInitials = (app: App) => {
  const label = (app.app_short_name ?? '').trim() || (app.app_name ?? '').trim() || (app.id ?? '').trim()
  return label ? initials(label) : ''
}

const expandedInfo = computed(() =>
  expandedAppId.value ? infoByAppId.value[expandedAppId.value] : undefined
)

const expandedInfoPending = computed(() =>
  expandedAppId.value ? Boolean(infoPendingByAppId.value[expandedAppId.value]) : false
)

const expandedInfoError = computed(() =>
  expandedAppId.value ? infoErrorByAppId.value[expandedAppId.value] : ''
)

const appsPending = computed(() => appsRef.value === undefined)
const isLoading = computed(
  () => Boolean(userPending.value) || Boolean(appsPending.value)
)

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '')

const devLocalBaseUrl = (app: App): string | null => {
  const keyCandidates = [
    app.id,
    app.slug,
    app.app_short_name,
    app.app_name,
  ]
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim().toLowerCase())

  const DEV_PORTS: Record<string, number> = {
    fireux: 3000,
    misebox: 3001,
    cleanbox: 3002,
    niederhorn: 3003,
    richies: 3004,
    'richies-reinigung': 3004,
    tenant: 3005,
  }

  for (const key of keyCandidates) {
    if (!key) continue
    if (DEV_PORTS[key]) return `http://localhost:${DEV_PORTS[key]}`
  }

  const joined = keyCandidates.join(' ')
  if (joined.includes('fireux')) return 'http://localhost:3000'
  if (joined.includes('misebox')) return 'http://localhost:3001'
  if (joined.includes('cleanbox')) return 'http://localhost:3002'
  if (joined.includes('niederhorn')) return 'http://localhost:3003'
  if (joined.includes('richies')) return 'http://localhost:3004'
  if (joined.includes('tenant')) return 'http://localhost:3005'

  return null
}

const appBaseUrl = (app: App): string | null => {
  // Dev: prefer local dev servers if we can infer a port.
  if (import.meta.dev) {
    const local = devLocalBaseUrl(app)
    if (local) return local
  }

  const anyApp = app as any
  const raw =
    (typeof anyApp.endpoint_url === 'string' && anyApp.endpoint_url) ||
    (typeof anyApp.endpointUrl === 'string' && anyApp.endpointUrl) ||
    (typeof anyApp.public_url === 'string' && anyApp.public_url) ||
    (typeof anyApp.publicUrl === 'string' && anyApp.publicUrl) ||
    ''

  const trimmed = raw.trim()
  if (!trimmed) return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  return normalizeBaseUrl(trimmed)
}

const avatarSrc = (app: App) => {
  const raw =
    userAppLogoUrl(app) ||
    app.avatar_url ||
    app.logo_url ||
    app.wordmark_url ||
    ''
  return getProxiedAvatarUrl(raw)
}

const ensureInfo = async (app: App) => {
  const id = app.id
  if (!id) return
  if (infoByAppId.value[id]) return
  if (infoPendingByAppId.value[id]) return

  const base = appBaseUrl(app)
  if (!base) {
    infoErrorByAppId.value[id] = import.meta.dev
      ? 'No local dev URL mapped and no endpoint configured.'
      : 'No app endpoint configured.'
    return
  }

  infoPendingByAppId.value[id] = true
  infoErrorByAppId.value[id] = ''
  try {
    if (typeof window === 'undefined') return
    const res = await fetch(`${base}/api/app/info`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      infoErrorByAppId.value[id] = `App info unavailable (${res.status}).`
      return
    }
    const json = (await res.json()) as AppInfoResponse
    infoByAppId.value[id] = json
  } catch {
    infoErrorByAppId.value[id] = 'Failed to load app info.'
  } finally {
    infoPendingByAppId.value[id] = false
  }
}

const toggle = async (app: App) => {
  if (expandedAppId.value === app.id) {
    expandedAppId.value = null
    return
  }
  expandedAppId.value = app.id
  await ensureInfo(app)
}
</script>
