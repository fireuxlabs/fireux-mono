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
      v-else-if="!runtimeData.endpoint"
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
            <span class="console-summary-value">{{ runtimeData.appRefCount }}</span>
          </div>
          <div class="console-summary-field">
            Resolved apps:
            <span class="console-summary-value">{{ runtimeData.apps.length }}</span>
          </div>
          <div class="console-summary-field">
            Endpoint:
            <span class="console-summary-value break-all">{{ runtimeData.endpoint }}</span>
          </div>
        </div>

        <div v-if="runtimeData.pendingRefs || runtimeData.pendingApps" class="console-card-header__description">
          Loading app facades...
        </div>

        <template v-else>
          <AppCollectionManager
            :collection="runtimeData.apps"
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
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsole'
import { useRuntimeProjectData } from 'fireux-core/runtime/composables/fireux/app/project-console/useRuntimeProjectData'
import { useAppInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { App } from 'fireux-core/runtime/models/core/app.model'

const { projectState, project } = useProjectConsole()
const runtimeData = useRuntimeProjectData({
  id: projectState.id,
  entity: projectState.entity,
  isDemo: projectState.isDemo,
  scenario: projectState.scenario,
})
const projectId = computed(() => projectState.id.value)
const focusedAppId = ref('')
const { pill: toAppPill, preview: toAppPreview, profile: toAppProfile } = useAppInterface()

watch(
  () => runtimeData.value.apps,
  (rows) => {
    if (!rows.length) {
      focusedAppId.value = ''
      return
    }

    if (!rows.some((row) => row.id === focusedAppId.value)) {
      focusedAppId.value =
        rows.find((row) => row.id === String(project.value?.app_id || '').trim())?.id ||
        rows[0]?.id ||
        ''
    }
  },
  { immediate: true }
)

const focusedApp = computed(() => {
  if (!runtimeData.value.apps.length) return null
  return (
    runtimeData.value.apps.find((row) => row.id === focusedAppId.value) ??
    runtimeData.value.apps[0] ??
    null
  )
})

const focusOptions = computed(() =>
  runtimeData.value.apps
    .map((app) => {
      const card = toAppPill(app)
      return card ? { app, card } : null
    })
    .filter(
      (entry): entry is { app: App; card: NonNullable<ReturnType<typeof toAppPill>> } =>
        Boolean(entry)
    )
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

const focusedInfoUrl = computed(() => {
  const raw = String(focusedSiteUrl.value || '').trim()
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
})

const dump = computed(() =>
  JSON.stringify(
    {
      endpoint: runtimeData.value.endpoint,
      projectId: projectId.value,
      appRefs: runtimeData.value.appRefs,
      apps: runtimeData.value.apps,
      focusedAppId: focusedAppId.value,
    },
    null,
    2
  )
)
</script>
