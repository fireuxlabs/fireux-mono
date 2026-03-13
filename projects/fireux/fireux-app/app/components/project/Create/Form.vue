<template>
  <div class="space-y-4">
    <UFormGroup
      label="FireUX console endpoint"
      required
      description="Add your URL."
    >
      <div class="flex flex-wrap gap-2">
        <UInput
          v-model="endpointUrl"
          class="flex-1 min-w-[18rem]"
          placeholder="Add your URL"
        />
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          :loading="fetchingMeta"
          @click="fetchProjectMeta"
        >
          Fetch
        </UButton>
      </div>
    </UFormGroup>

    <UAlert
      v-if="projectMeta"
      color="primary"
      variant="soft"
      title="Project endpoint connected"
      :description="`${projectMeta.firebase_project_id} · ${projectMeta.app_id} · ${projectMeta.ecosystem_id}`"
    />

    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
    </div>

    <DevJson
      v-if="isDev"
      title="Project Create Debug"
      context="console/projects/create · endpoint fetch"
      :data="debugState"
      :default-open="true"
    />

    <div class="flex flex-wrap gap-2">
      <UButton
        color="primary"
        icon="i-lucide-plus"
        :loading="submitting"
        :disabled="!projectMeta"
        @click="submit"
      >
        Create project
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useRuntimeProjectSelection } from 'fireux-core/runtime/composables/fireux/app/runtime-project/state'
import { useProjectCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/project/mutations/useProjectCreate'
import type { FireuxProjectType } from 'fireux-core/runtime/models/system/project.model'

const props = withDefaults(defineProps<{
  returnTo?: string
  cancelTo?: string
}>(), {
  returnTo: '',
  cancelTo: '',
})

const emit = defineEmits<{
  (event: 'created', projectId: string): void
}>()

const route = useRoute()
const router = useRouter()
const { setRuntimeProject } = useRuntimeProjectSelection()
const { createProject } = useProjectCreate()

type FireuxConsoleApp = {
  id: string
  name: string
  slug: string
  ecosystem_id: string
}

type FireuxConsolePayload = {
  project: {
    id: string
  }
  databases: Array<{
    name: string
    apps: FireuxConsoleApp[]
  }>
}

type ProjectMeta = {
  name: string
  description: string
  slug: string
  project_type: FireuxProjectType
  source_url: string
  console_endpoint_url: string
  app_id: string
  ecosystem_id: string
  firebase_project_id: string
}

const endpointUrl = ref('')
const fetchingMeta = ref(false)
const projectMeta = ref<ProjectMeta | null>(null)
const submitting = ref(false)
const error = ref('')
const lastFetchUrl = ref('')
const lastFetchStatus = ref<number | null>(null)
const lastFetchPayload = ref<unknown>(null)
const isDev = import.meta.dev

const resolvedReturnTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  const queryValue = String(route.query.returnTo || '').trim()
  if (queryValue.startsWith('/')) return queryValue
  return '/console/projects/overview'
})

watch(endpointUrl, () => {
  projectMeta.value = null
})

function toSlug(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toLabel(value: string) {
  return String(value || '')
    .trim()
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeFireuxConsoleEndpoint(value: string) {
  const raw = String(value || '').trim()
  if (!raw) {
    throw new Error('Project endpoint URL is required')
  }

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error('Enter a valid project endpoint URL')
  }

  if (url.pathname === '' || url.pathname === '/') {
    url.pathname = '/api/fireux-console'
    return url.toString()
  }

  if (url.pathname === '/api/fireux-console') {
    return url.toString()
  }

  throw new Error('Use the app URL or the full /api/fireux-console endpoint')
}

function pickMainApp(databases: Array<{ name: string; apps: FireuxConsoleApp[] }>) {
  const nonSystem = databases.filter(
    (entry) => entry.name !== '(default)' && entry.name !== 'registry'
  )

  for (const database of nonSystem) {
    const main = database.apps.find((app) => app.id.endsWith('-app'))
    if (main) return main
    if (database.apps[0]) return database.apps[0]
  }

  for (const database of databases) {
    const main = database.apps.find((app) => app.id.endsWith('-app'))
    if (main) return main
    if (database.apps[0]) return database.apps[0]
  }

  return null
}

function readProjectMeta(payload: unknown, normalizedUrl: string) {
  const next = payload as FireuxConsolePayload | null
  if (!next?.project || !Array.isArray(next.databases)) {
    throw new Error('Project endpoint did not return the required console data')
  }

  const projectId = String(next.project.id || '').trim()
  if (!projectId) throw new Error('Project endpoint did not return a project id')

  const endpoint = new URL(normalizedUrl)
  const sourceUrl = endpoint.origin
  const nonSystemDatabase = next.databases.find(
    (entry) => entry.name !== '(default)' && entry.name !== 'registry'
  )
  const ecosystemId = String(nonSystemDatabase?.name || 'standalone').trim()
  const projectType = (
    ecosystemId === 'standalone' ? 'standalone-app' : 'ecosystem-app'
  ) as FireuxProjectType
  const mainApp = pickMainApp(next.databases)
  const appId = String(mainApp?.id || `${toSlug(projectId)}-app`).trim()
  const hostLabel = toLabel(endpoint.hostname.split('.')[0] || projectId)
  const appLabel = String(mainApp?.name || '').trim()
  const name = appLabel || hostLabel || projectId
  const slug = toSlug(projectId)

  return {
    name,
    description: '',
    slug,
    project_type: projectType,
    source_url: sourceUrl,
    console_endpoint_url: normalizedUrl,
    app_id: appId,
    ecosystem_id: ecosystemId,
    firebase_project_id: projectId,
  }
}

const debugState = computed(() => ({
  endpointUrl: endpointUrl.value,
  lastFetchUrl: lastFetchUrl.value,
  lastFetchStatus: lastFetchStatus.value,
  projectMeta: projectMeta.value,
  error: error.value,
  payload: lastFetchPayload.value,
}))

const fetchProjectMeta = async () => {
  if (fetchingMeta.value) return

  fetchingMeta.value = true
  error.value = ''
  lastFetchStatus.value = null
  lastFetchPayload.value = null

  try {
    const normalizedUrl = normalizeFireuxConsoleEndpoint(endpointUrl.value)
    lastFetchUrl.value = normalizedUrl
    const response = await fetch(normalizedUrl)
    lastFetchStatus.value = response.status
    if (!response.ok) {
      throw new Error(`Project endpoint returned ${response.status}`)
    }

    const payload = await response.json()
    lastFetchPayload.value = payload
    const nextMeta = readProjectMeta(payload, normalizedUrl)

    endpointUrl.value = normalizedUrl
    projectMeta.value = nextMeta
  } catch (err) {
    projectMeta.value = null
    if (err instanceof TypeError) {
      error.value = `Unable to reach ${lastFetchUrl.value || 'the project endpoint'}. Check the URL, CORS, and that the app is live.`
    } else {
      error.value =
        err instanceof Error ? err.message : 'Unable to fetch project metadata'
    }
  } finally {
    fetchingMeta.value = false
  }
}

const submit = async () => {
  if (submitting.value) return

  error.value = ''
  submitting.value = true

  try {
    if (!projectMeta.value) {
      throw new Error('Fetch the project endpoint before creating the project')
    }

    const projectId = await createProject({
      name: projectMeta.value.name,
      slug: projectMeta.value.slug,
      description: projectMeta.value.description,
      project_type: projectMeta.value.project_type,
      source_url: projectMeta.value.source_url,
      console_endpoint_url: projectMeta.value.console_endpoint_url,
      app_id: projectMeta.value.app_id,
      ecosystem_id: projectMeta.value.ecosystem_id,
      firebase_project_id: projectMeta.value.firebase_project_id,
    })

    setRuntimeProject({ projectId, mode: 'live' })
    emit('created', projectId)

    if (route.path !== resolvedReturnTo.value) {
      await router.push(resolvedReturnTo.value)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to create project'
  } finally {
    submitting.value = false
  }
}
</script>
