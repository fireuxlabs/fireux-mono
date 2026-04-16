import { $fetch } from 'ofetch'
import { computed, ref, watch, type Ref } from 'vue'
import type { App } from '../../../../models/core/app.model'
import type { Project } from '../../../../models/system/project.model'
import { useEcosystemFetch } from '../../firestore/system/ecosystem/fetch/useEcosystemFetch'
import type { DemoProjectScenario } from './demo-scenarios/_shared/types'
import {
  resolveFireuxConsoleEndpoint,
  type FireuxConsoleAppRef,
  type FireuxConsolePayload,
} from '../../firestore/system/project/utils/fireuxConsoleProjectFacade'

type UseRuntimeProjectDataParams = {
  id: Ref<string> | string
  entity: Ref<Project | null | undefined>
  isDemo?: Ref<boolean>
  scenario?: Ref<DemoProjectScenario | null | undefined>
}

type PublicAppInfoPayload = {
  app?: Partial<App> | null
}

const safeString = (value: unknown) => String(value ?? '').trim()

const normalizeAppInfoUrl = (url: string) => {
  const raw = safeString(url)
  if (!raw) return ''

  try {
    const parsed = new URL(raw)
    parsed.pathname = '/api/public/app/info'
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return ''
  }
}

const mapPublicApp = (
  source: Partial<App>,
  fallback: FireuxConsoleAppRef,
  fallbackProjectId: string,
  fallbackEcosystemId: string
): App => ({
  id: safeString(source.id || fallback.id),
  project_id: safeString((source as any).project_id || fallbackProjectId),
  ecosystem_id: safeString((source as any).ecosystem_id || fallbackEcosystemId),
  slug: safeString(source.slug || fallback.id),
  status: safeString(source.status || 'active') as App['status'],
  team: safeString((source as any).team),
  app_name: safeString((source as any).app_name || fallback.id),
  app_short_name: safeString((source as any).app_short_name),
  role: safeString((source as any).role) as App['role'],
  ecosystem: safeString((source as any).ecosystem || fallbackEcosystemId),
  tagline: safeString((source as any).tagline),
  description: safeString((source as any).description),
  short_bio: safeString((source as any).short_bio),
  long_bio: safeString((source as any).long_bio),
  social_links: {
    website: safeString((source as any)?.social_links?.website || fallback.url),
  },
  derived: {
    user_count:
      typeof (source as any)?.derived?.user_count === 'number'
        ? (source as any).derived.user_count
        : 0,
  },
  media: {
    thumbnail_url: safeString((source as any)?.media?.thumbnail_url),
    logo_url: safeString((source as any)?.media?.logo_url),
    wordmark_light_url: safeString((source as any)?.media?.wordmark_light_url),
    wordmark_dark_url: safeString((source as any)?.media?.wordmark_dark_url),
    cover_url: safeString((source as any)?.media?.cover_url),
  },
  join_requests: [],
  admin_ids: [],
  moderation_state: '',
  ban_reasons: [],
  created: {
    at: {} as App['created']['at'],
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: {} as App['updated']['at'],
    by: undefined,
  },
})

export function useRuntimeProjectData(params: UseRuntimeProjectDataParams) {
  const projectId = computed(() =>
    typeof params.id === 'string'
      ? safeString(params.id)
      : safeString(params.id.value)
  )
  const entity = computed(() => params.entity.value ?? null)
  const isDemo = computed(() => Boolean(params.isDemo?.value))
  const scenario = computed(() => params.scenario?.value ?? null)
  const mainAppId = computed(() => safeString(entity.value?.app_id))
  const ecosystemId = computed(() => safeString(entity.value?.ecosystem_id))
  const endpoint = computed(() => {
    if (isDemo.value) return `demo://project/${projectId.value}`
    if (!entity.value) return ''

    try {
      return resolveFireuxConsoleEndpoint(entity.value)
    } catch {
      return ''
    }
  })

  const ecosystemLookupId = computed(() =>
    isDemo.value ? '' : ecosystemId.value
  )
  const { ecosystem: liveEcosystem, pending: liveEcosystemPending } =
    useEcosystemFetch(ecosystemLookupId)

  const endpointEcosystem = ref<FireuxConsolePayload['ecosystem']>(null)
  const appRefs = ref<FireuxConsoleAppRef[]>([])
  const appsResolved = ref<App[]>([])
  const pendingRefs = ref(false)
  const pendingApps = ref(false)
  const loadId = ref(0)

  watch(
    [endpoint, projectId, ecosystemId],
    async ([nextEndpoint, nextProjectId, nextEcosystemId]) => {
      const currentLoadId = ++loadId.value

      endpointEcosystem.value = null
      appRefs.value = []
      appsResolved.value = []
      pendingRefs.value = false
      pendingApps.value = false

      if (isDemo.value) {
        const scenarioApps = Array.isArray(scenario.value?.apps)
          ? scenario.value.apps
          : []
        appRefs.value = scenarioApps.map((app) => ({
          id: safeString(app.id),
          url: safeString(app.social_links?.website),
        }))
        appsResolved.value = scenarioApps
        return
      }

      if (!nextEndpoint) return

      pendingRefs.value = true
      try {
        const payload = await $fetch<FireuxConsolePayload>(nextEndpoint)
        if (currentLoadId !== loadId.value) return
        endpointEcosystem.value = payload?.ecosystem ?? null
        appRefs.value = Array.isArray(payload?.apps) ? payload.apps : []
      } catch {
        if (currentLoadId !== loadId.value) return
        endpointEcosystem.value = null
        appRefs.value = []
      } finally {
        if (currentLoadId === loadId.value) {
          pendingRefs.value = false
        }
      }

      if (!appRefs.value.length) return

      pendingApps.value = true
      try {
        const rows = await Promise.all(
          appRefs.value.map(async (appRef) => {
            const infoUrl = normalizeAppInfoUrl(appRef.url)
            if (!infoUrl) return null

            try {
              const payload = await $fetch<PublicAppInfoPayload>(infoUrl)
              if (!payload?.app) return null

              return mapPublicApp(
                payload.app,
                appRef,
                nextProjectId,
                nextEcosystemId
              )
            } catch {
              return null
            }
          })
        )

        if (currentLoadId !== loadId.value) return
        appsResolved.value = rows.filter((entry): entry is App =>
          Boolean(entry?.id)
        )
      } finally {
        if (currentLoadId === loadId.value) {
          pendingApps.value = false
        }
      }
    },
    { immediate: true }
  )

  const apps = computed(() => {
    const rows = [...appsResolved.value]
    const preferredId = mainAppId.value

    if (!preferredId) return rows

    rows.sort((a, b) => {
      if (a.id === preferredId && b.id !== preferredId) return -1
      if (b.id === preferredId && a.id !== preferredId) return 1
      return a.id.localeCompare(b.id)
    })

    return rows
  })

  const appRefCount = computed(() => appRefs.value.length)
  const ecosystem = computed(() => {
    if (isDemo.value) {
      const scenarioEcosystem = Array.isArray(scenario.value?.ecosystems)
        ? (scenario.value?.ecosystems.find(
            (entry) => safeString(entry?.id) === ecosystemId.value
          ) ??
          scenario.value?.ecosystems[0] ??
          null)
        : null

      return scenarioEcosystem ?? null
    }

    return liveEcosystem.value ?? endpointEcosystem.value ?? null
  })
  const ecosystemPending = computed(() => {
    if (isDemo.value) return false
    return liveEcosystemPending.value || pendingRefs.value
  })
  const runtimeData = computed(() => ({
    isDemo: isDemo.value,
    ecosystemId: ecosystemId.value,
    ecosystem: ecosystem.value,
    ecosystemPending: ecosystemPending.value,
    endpoint: endpoint.value,
    appRefs: appRefs.value,
    appRefCount: appRefCount.value,
    apps: apps.value,
    pendingRefs: pendingRefs.value,
    pendingApps: pendingApps.value,
    pending: ecosystemPending.value || pendingRefs.value || pendingApps.value,
  }))

  return runtimeData
}
