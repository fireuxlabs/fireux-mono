<template>
  <section class="space-y-6">
    <UAlert
      v-if="!projectId"
      color="neutral"
      variant="soft"
      title="No project selected"
      description="Select a project on /console/projects before viewing its ecosystem surface."
    />

    <template v-else>
      <UAlert
        v-if="syncErrorMessage"
        color="warning"
        variant="soft"
        title="Live sync failed"
        :description="syncErrorMessage"
      />

      <UAlert
        v-else-if="pending || syncing"
        color="neutral"
        variant="soft"
        title="Syncing ecosystem data"
        :description="`Fetching ${projectTitle} from ${consoleEndpointLabel}.`"
      />

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex min-w-0 items-start gap-3">
              <UAvatar
                :src="projectImageUrl || undefined"
                :alt="projectTitle"
                :text="projectTitle"
                icon="i-lucide-orbit"
                size="xl"
              />

              <div class="min-w-0 space-y-1">
                <div class="text-lg font-semibold text-default">
                  {{ projectTitle }}
                </div>

                <div class="text-sm text-dimmed">
                  <span v-if="projectSlug">{{ projectSlug }}</span>
                  <span v-else class="italic">missing slug</span>
                </div>

                <p class="max-w-3xl text-sm text-dimmed">
                  {{ projectDescription || 'No ecosystem description has been set yet.' }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge v-if="projectStatus" color="neutral" variant="soft">
                {{ projectStatus }}
              </UBadge>
              <UBadge v-if="projectTypeLabel" color="neutral" variant="soft">
                {{ projectTypeLabel }}
              </UBadge>
              <UBadge color="neutral" variant="soft">
                {{ primaryProjectLabel }}
              </UBadge>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-dimmed">
            Stored project data is refreshed from the live console endpoint when this page opens.
          </p>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="projectSourceUrl"
              :to="projectSourceUrl"
              target="_blank"
              rel="noreferrer"
              color="neutral"
              variant="soft"
              icon="i-lucide-external-link"
            >
              Open app
            </UButton>

            <UButton
              v-if="consoleEndpoint"
              :to="consoleEndpoint"
              target="_blank"
              rel="noreferrer"
              color="neutral"
              variant="ghost"
              icon="i-lucide-file-json"
            >
              Open console API
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 lg:grid-cols-2">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Identity</div>
              <p class="text-sm text-dimmed">
                Canonical identifiers for this ecosystem project.
              </p>
            </div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Ecosystem ID</div>
              <div class="font-mono text-xs break-all text-default">
                {{ ecosystemIdLabel }}
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">App ID</div>
              <div class="font-mono text-xs break-all text-default">
                {{ appIdLabel }}
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Firebase Project</div>
              <div class="font-mono text-xs break-all text-default">
                {{ firebaseProjectIdLabel }}
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Slug</div>
              <div class="text-sm text-default">
                {{ projectSlug || 'Missing' }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Surfaces</div>
              <p class="text-sm text-dimmed">
                Public and console endpoints currently stored for this project.
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Source URL</div>
              <div class="text-sm break-all text-default">
                <a
                  v-if="projectSourceUrl"
                  :href="projectSourceUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="underline-offset-4 hover:underline"
                >
                  {{ projectSourceUrl }}
                </a>
                <span v-else class="italic text-dimmed">missing</span>
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Console Endpoint</div>
              <div class="text-sm break-all text-default">
                <a
                  v-if="consoleEndpoint"
                  :href="consoleEndpoint"
                  target="_blank"
                  rel="noreferrer"
                  class="underline-offset-4 hover:underline"
                >
                  {{ consoleEndpoint }}
                </a>
                <span v-else class="italic text-dimmed">missing</span>
              </div>
            </div>
          </div>
        </UCard>

        <UCard class="lg:col-span-2">
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">System Record</div>
              <p class="text-sm text-dimmed">
                Stored flags and ownership for the selected project.
              </p>
            </div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Status</div>
              <div class="text-sm text-default">
                {{ projectStatus || 'Missing' }}
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Project Type</div>
              <div class="text-sm text-default">
                {{ projectTypeLabel || 'Missing' }}
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Primary Project</div>
              <div class="text-sm text-default">
                {{ primaryProjectLabel }}
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Owner User</div>
              <div class="font-mono text-xs break-all text-default">
                {{ ownerUserIdLabel }}
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useActiveProject } from 'fireux-core/runtime/composables/fireux/app/project-console/useActiveProject'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type { ProjectType, ProjectUpdateInput } from 'fireux-core/runtime/models/system/project.model'

type FireuxConsolePayload = {
  ok?: boolean
  project?: Record<string, unknown>
  project_meta?: Record<string, unknown>
  ecosystems?: unknown[]
  ecosystem_apps?: unknown[]
  databases?: unknown[]
}

const runtime = useActiveProject()
const project = computed(() => runtime.project.value as Record<string, unknown> | null)
const { updateDocument } = useFirestoreUpdate()
const syncing = ref(false)
const autoSyncAttemptedKey = ref('')
const syncErrorMessage = ref('')

const normalizeString = (value: unknown): string => String(value || '').trim()
const labelize = (value: unknown): string =>
  normalizeString(value)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
const normalizeProjectType = (value: unknown): ProjectType | '' => {
  const normalized = normalizeString(value).replace(/-/g, '_')
  if (normalized === 'ecosystem_app' || normalized === 'standalone_app') {
    return normalized
  }
  return ''
}

const projectId = computed(() => normalizeString(runtime.id.value))
const projectTitle = computed(
  () =>
    normalizeString(project.value?.name) ||
    normalizeString(project.value?.slug) ||
    projectId.value ||
    'Selected Project'
)
const projectSlug = computed(() => normalizeString(project.value?.slug))
const projectDescription = computed(() => normalizeString(project.value?.description))
const projectStatus = computed(() => labelize(project.value?.status))
const projectTypeLabel = computed(() => labelize(project.value?.project_type))
const projectImageUrl = computed(() => normalizeString(project.value?.image_url))
const projectSourceUrl = computed(() => normalizeString(project.value?.source_url))
const ecosystemIdLabel = computed(() => normalizeString(project.value?.ecosystem_id) || 'Missing')
const appIdLabel = computed(() => normalizeString(project.value?.app_id) || 'Missing')
const firebaseProjectIdLabel = computed(() =>
  normalizeString(project.value?.firebase_project_id) || 'Missing'
)
const ownerUserIdLabel = computed(() =>
  normalizeString(project.value?.owner_user_id) || 'Missing'
)
const primaryProjectLabel = computed(() =>
  project.value?.primary_project ? 'Primary project' : 'Supporting project'
)

const resolveConsoleEndpoint = () => {
  const raw =
    normalizeString(project.value?.console_endpoint_url) ||
    normalizeString(project.value?.source_url)

  if (!raw) return ''

  try {
    const url = new URL(raw)
    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = '/api/fireux-console'
    }
    return url.toString()
  } catch {
    return ''
  }
}

const consoleEndpoint = computed(() => resolveConsoleEndpoint())
const consoleEndpointLabel = computed(() => consoleEndpoint.value || 'Missing endpoint')
const endpointKey = computed(() => `${projectId.value}:${consoleEndpoint.value}`)

const {
  data: liveConsoleData,
  pending,
  error: consoleCompareError,
} = await useAsyncData(
  'console-project-ecosystem-compare',
  async () => {
    if (!projectId.value || !consoleEndpoint.value) return null
    return await $fetch<FireuxConsolePayload>(consoleEndpoint.value)
  },
  {
    watch: [endpointKey],
    default: () => null,
    server: false,
  }
)

const consoleCompareErrorMessage = computed(() => {
  const value = consoleCompareError.value
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value) {
    return normalizeString((value as any).message || (value as any).statusMessage)
  }
  return 'Unable to load the live console payload.'
})

const normalizedLiveProject = computed<ProjectUpdateInput | null>(() => {
  const payload = liveConsoleData.value
  const meta = (payload?.project_meta ?? {}) as Record<string, unknown>
  const liveControl = (payload?.project ?? {}) as Record<string, unknown>
  const endpoint = consoleEndpoint.value

  if (!payload || !endpoint) return null

  let endpointOrigin = ''
  try {
    endpointOrigin = new URL(endpoint).origin
  } catch {
    endpointOrigin = ''
  }

  const firebaseProjectId =
    normalizeString(meta.firebase_project_id) ||
    normalizeString(liveControl.id)

  return {
    name: normalizeString(meta.name),
    slug: normalizeString(meta.slug) || firebaseProjectId,
    description: normalizeString(meta.description),
    image_url: normalizeString(meta.image_url),
    project_type:
      normalizeProjectType(meta.project_type) ||
      normalizeProjectType(project.value?.project_type),
    source_url: normalizeString(meta.source_url) || endpointOrigin,
    console_endpoint_url:
      normalizeString(meta.console_endpoint_url) || endpoint,
    app_id:
      normalizeString(meta.app_id) ||
      normalizeString(liveControl.main_app_id),
    ecosystem_id:
      normalizeString(meta.ecosystem_id) ||
      normalizeString(liveControl.main_ecosystem_id),
    firebase_project_id: firebaseProjectId,
  }
})

const projectRefreshPatch = computed<ProjectUpdateInput | null>(() => {
  const local = project.value
  const live = normalizedLiveProject.value

  if (!local || !live) return null

  const next: ProjectUpdateInput = {}

  const assignIfChanged = (key: keyof ProjectUpdateInput, value: unknown) => {
    const normalizedValue = normalizeString(value)
    const normalizedCurrent = normalizeString(local[key as string])
    if (normalizedValue === normalizedCurrent) return
    ;(next as Record<string, unknown>)[key] = value
  }

  assignIfChanged('name', live.name)
  assignIfChanged('slug', live.slug)
  assignIfChanged('description', live.description)
  assignIfChanged('image_url', live.image_url)
  assignIfChanged('project_type', live.project_type)
  assignIfChanged('source_url', live.source_url)
  assignIfChanged('console_endpoint_url', live.console_endpoint_url)
  assignIfChanged('app_id', live.app_id)
  assignIfChanged('ecosystem_id', live.ecosystem_id)
  assignIfChanged('firebase_project_id', live.firebase_project_id)

  return Object.keys(next).length ? next : null
})

const syncStoredProjectFromLive = async () => {
  if (!projectId.value || !consoleEndpoint.value || syncing.value) return

  syncing.value = true
  syncErrorMessage.value = ''

  try {
    if (consoleCompareError.value || !liveConsoleData.value) {
      throw new Error(consoleCompareErrorMessage.value || 'Live console fetch failed.')
    }

    const patch = projectRefreshPatch.value
    if (!patch) return

    await updateDocument<ProjectUpdateInput>('projects', projectId.value, patch)
  } catch (error) {
    syncErrorMessage.value =
      error instanceof Error ? error.message : 'Unable to refresh the stored project.'
  } finally {
    syncing.value = false
  }
}

watch(
  [endpointKey, pending, liveConsoleData, consoleCompareErrorMessage],
  async ([key, isPending, data, errorMessage]) => {
    if (!key || isPending || !data || errorMessage || syncing.value) return
    if (autoSyncAttemptedKey.value === key) return

    autoSyncAttemptedKey.value = key
    await syncStoredProjectFromLive()
  },
  { immediate: true }
)
</script>
