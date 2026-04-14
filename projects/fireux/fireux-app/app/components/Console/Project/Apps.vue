<template>
  <section class="console-surface">
    <UAlert
      v-if="!project"
      color="neutral"
      variant="soft"
      title="No project selected"
      description="Choose a project in the console first to inspect its apps."
    />

    <UAlert
      v-else-if="!endpoint"
      color="warning"
      variant="soft"
      title="No console endpoint"
      description="The selected project does not expose a project console endpoint."
    />

    <UCard v-else>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Apps</div>
          <p class="console-card-header__description">
            App refs come from the selected project endpoint, then each app resolves its own public
            app facade.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <div class="console-summary-grid">
          <div class="console-summary-field">
            Project ID:
            <span class="console-summary-value">{{ projectId }}</span>
          </div>
          <div class="console-summary-field">
            App refs:
            <span class="console-summary-value">{{ appRefCount }}</span>
          </div>
          <div class="console-summary-field">
            Resolved apps:
            <span class="console-summary-value">{{ apps.length }}</span>
          </div>
          <div class="console-summary-field">
            Endpoint:
            <span class="console-summary-value break-all">{{ endpoint }}</span>
          </div>
        </div>

        <div v-if="pendingRefs || pendingApps" class="console-card-header__description">
          Loading app facades...
        </div>

        <template v-else>
          <AppCollectionManager
            :collection="apps"
            title="Apps"
            description="Apps belonging to the selected project."
          />

          <div
            v-if="focusedApp && focusedPreview && focusedProfile"
            class="space-y-4 border-t border-default/40 pt-4"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div class="console-card-header">
                <div class="console-card-header__title">App Focus</div>
                <p class="console-card-header__description">
                  Spotlight the selected app using the app&rsquo;s own public facade.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UBadge variant="soft" color="neutral">
                  Focused: {{ focusedApp.app_name || focusedApp.id }}
                </UBadge>

                <UButton
                  v-if="focusedSiteUrl"
                  :to="focusedSiteUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xs"
                  variant="soft"
                  icon="i-lucide-external-link"
                >
                  Open App
                </UButton>

                <UButton
                  v-if="focusedInfoUrl"
                  :to="focusedInfoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-braces"
                >
                  Public API
                </UButton>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <AppCardsPill
                v-for="item in focusOptions"
                :key="item.app.id"
                v-bind="item.card"
                :link="false"
                :action="true"
                :class="[
                  'cursor-pointer transition',
                  item.app.id === focusedApp.id ? 'ring-2 ring-primary' : 'opacity-90 hover:opacity-100',
                ]"
                @action="focusedAppId = item.app.id"
              />
            </div>

            <div class="console-surface__grid xl:grid-cols-[320px_minmax(0,1fr)]">
              <AppCardsPreview v-bind="focusedPreview" />

              <AppCardsProfile
                :app="focusedApp"
                v-bind="focusedProfile"
              />
            </div>
          </div>
        </template>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="console-card-header__title">Apps JSON</div>
      </template>

      <pre class="console-code">{{ dump }}</pre>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useActiveProject } from 'fireux-core/runtime/composables/fireux/app/project-console/useActiveProject'
import { useAppInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import {
  resolveFireuxConsoleEndpoint,
  type FireuxConsolePayload,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/fireuxConsoleProjectFacade'
import type { App } from 'fireux-core/runtime/models/core/app.model'

const { project } = useActiveProject()
const endpoint = computed(() => {
  if (!project.value) return ''

  try {
    return resolveFireuxConsoleEndpoint(project.value)
  } catch {
    return ''
  }
})
const projectId = computed(() => String(project.value?.id || '').trim())
const mainAppId = computed(() => String(project.value?.app_id || '').trim())

type PublicAppInfoPayload = {
  app?: Partial<App> | null
}

function normalizeAppInfoUrl(url: string) {
  const raw = String(url || '').trim()
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

const { data: payload, pending: pendingRefs } = useAsyncData(
  'fireux-project-apps',
  async () => {
    if (!endpoint.value) return null
    return await $fetch<FireuxConsolePayload>(endpoint.value)
  },
  {
    server: false,
    watch: [endpoint],
    default: () => null,
  }
)

const appRefs = computed(() => payload.value?.apps ?? [])
const appRefCount = computed(() => appRefs.value.length)

const { data: appsResolved, pending: pendingApps } = useAsyncData(
  'fireux-project-app-info',
  async () => {
    if (!appRefs.value.length) return []

    const rows = await Promise.all(
      appRefs.value.map(async (ref) => {
        const infoUrl = normalizeAppInfoUrl(ref.url)
        if (!infoUrl) return null

        try {
          const payload = await $fetch<PublicAppInfoPayload>(infoUrl)
          const app = payload?.app
          if (!app) return null

          return {
            id: String(app.id || ref.id || '').trim(),
            project_id: String((app as any).project_id || projectId.value || '').trim(),
            ecosystem_id: String((app as any).ecosystem_id || project.value?.ecosystem_id || '').trim(),
            slug: String(app.slug || ref.id || '').trim(),
            status: String(app.status || 'active').trim(),
            team: String((app as any).team || '').trim(),
            app_name: String((app as any).app_name || ref.id || '').trim(),
            app_short_name: String((app as any).app_short_name || '').trim(),
            role: String((app as any).role || '').trim(),
            ecosystem: String((app as any).ecosystem || project.value?.ecosystem_id || '').trim(),
            tagline: String((app as any).tagline || '').trim(),
            description: String((app as any).description || '').trim(),
            short_bio: String((app as any).short_bio || '').trim(),
            long_bio: String((app as any).long_bio || '').trim(),
            social_links: {
              website:
                String((app as any)?.social_links?.website || ref.url || '').trim(),
            },
            derived: {
              user_count:
                typeof (app as any)?.derived?.user_count === 'number'
                  ? (app as any).derived.user_count
                  : 0,
            },
            media: {
              thumbnail_url: String((app as any)?.media?.thumbnail_url || '').trim(),
              logo_url: String((app as any)?.media?.logo_url || '').trim(),
              wordmark_light_url: String((app as any)?.media?.wordmark_light_url || '').trim(),
              wordmark_dark_url: String((app as any)?.media?.wordmark_dark_url || '').trim(),
              cover_url: String((app as any)?.media?.cover_url || '').trim(),
            },
            join_requests: [],
            admin_ids: [],
            moderation_state: '',
            ban_reasons: [],
          } as App
        } catch {
          return null
        }
      })
    )

    return rows.filter((entry): entry is App => Boolean(entry?.id))
  },
  {
    server: false,
    watch: [appRefs],
    default: () => [],
  }
)

const apps = computed(() => {
  const rows = [...(appsResolved.value ?? [])]
  const preferredId = mainAppId.value

  if (!preferredId) return rows

  rows.sort((a, b) => {
    if (a.id === preferredId && b.id !== preferredId) return -1
    if (b.id === preferredId && a.id !== preferredId) return 1
    return a.id.localeCompare(b.id)
  })

  return rows
})
const focusedAppId = ref('')
const { pill: toAppPill, preview: toAppPreview, profile: toAppProfile } = useAppInterface()

watch(
  apps,
  (rows) => {
    if (!rows.length) {
      focusedAppId.value = ''
      return
    }

    if (!rows.some((row) => row.id === focusedAppId.value)) {
      focusedAppId.value =
        rows.find((row) => row.id === mainAppId.value)?.id ||
        rows[0]?.id ||
        ''
    }
  },
  { immediate: true }
)

const focusedApp = computed(() => {
  if (!apps.value.length) return null
  return apps.value.find((row) => row.id === focusedAppId.value) ?? apps.value[0] ?? null
})

const focusOptions = computed(() =>
  apps.value
    .map((app) => {
      const card = toAppPill(app)
      return card ? { app, card } : null
    })
    .filter((entry): entry is { app: App; card: NonNullable<ReturnType<typeof toAppPill>> } => Boolean(entry))
)

const focusedPreview = computed(() =>
  focusedApp.value ? toAppPreview(focusedApp.value) : null
)

const focusedProfile = computed(() =>
  focusedApp.value ? toAppProfile(focusedApp.value) : null
)

const focusedSiteUrl = computed(() =>
  String(focusedApp.value?.social_links?.website || '').trim()
)

const focusedInfoUrl = computed(() => normalizeAppInfoUrl(focusedSiteUrl.value))

const dump = computed(() =>
  JSON.stringify(
    {
      endpoint: endpoint.value,
      projectId: projectId.value,
      appRefs: appRefs.value,
      apps: apps.value,
      focusedAppId: focusedAppId.value,
    },
    null,
    2
  )
)
</script>
