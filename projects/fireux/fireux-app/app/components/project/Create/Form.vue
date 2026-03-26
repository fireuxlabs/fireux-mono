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
      <UButton
        v-if="cancelTo"
        :to="cancelTo"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Cancel
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useRuntimeProjectSelection } from 'fireux-core/runtime/composables/fireux/app/runtime-project/state'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useProjectCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/project/mutations/useProjectCreate'
import type { FireuxProjectType } from 'fireux-core/runtime/models/system/project.model'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
  returnTo: '',
  cancelTo: '',
})

const emit = defineEmits<{
  (event: 'created', result: ConsoleEnsureResult): void
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

type FireuxConsoleProjectMeta = {
  name: string
  slug: string
  description: string
  image_url: string
  project_type: FireuxProjectType
  source_url: string
  console_endpoint_url: string
  app_id: string
  ecosystem_id: string
  firebase_project_id: string
}

type FireuxConsolePayload = {
  project: {
    id: string
    main_app_id: string
    main_ecosystem_id: string
  }
  project_meta: FireuxConsoleProjectMeta
  databases: Array<{
    name: string
    apps: FireuxConsoleApp[]
  }>
}

type ProjectMeta = {
  name: string
  description: string
  slug: string
  image_url: string
  primary_project: boolean
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
  return props.mode === 'public' ? '/projects' : '/console/projects/overview'
})

watch(endpointUrl, () => {
  projectMeta.value = null
})

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

function readProjectMeta(payload: unknown, normalizedUrl: string) {
  const next = payload as FireuxConsolePayload | null
  if (!next?.project || !next?.project_meta || !Array.isArray(next.databases)) {
    throw new Error('Project endpoint did not return the required console data')
  }

  const meta = next.project_meta
  const firebaseProjectId = String(meta.firebase_project_id || next.project.id || '').trim()
  if (!firebaseProjectId) {
    throw new Error('Project endpoint did not return a project id')
  }

  const normalizedEndpoint = normalizeFireuxConsoleEndpoint(normalizedUrl)

  return {
    name: String(meta.name || '').trim(),
    description: String(meta.description || '').trim(),
    slug: String(meta.slug || firebaseProjectId).trim(),
    image_url: String(meta.image_url || '').trim(),
    primary_project: true,
    project_type: String(meta.project_type || '').trim() as FireuxProjectType,
    source_url: String(meta.source_url || new URL(normalizedEndpoint).origin).trim(),
    console_endpoint_url: String(meta.console_endpoint_url || normalizedEndpoint).trim(),
    app_id: String(meta.app_id || next.project.main_app_id || '').trim(),
    ecosystem_id: String(meta.ecosystem_id || next.project.main_ecosystem_id || '').trim(),
    firebase_project_id: firebaseProjectId,
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
    endpointUrl.value = normalizedUrl
    lastFetchUrl.value = normalizedUrl

    const response = await fetch(normalizedUrl)
    lastFetchStatus.value = response.status
    if (!response.ok) {
      throw new Error(`Project endpoint returned ${response.status}`)
    }

    const payload = await response.json()
    lastFetchPayload.value = payload
    projectMeta.value = readProjectMeta(payload, normalizedUrl)
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

    const result = await createProject({
      id: projectMeta.value.firebase_project_id,
      name: projectMeta.value.name,
      slug: projectMeta.value.slug,
      description: projectMeta.value.description,
      image_url: projectMeta.value.image_url,
      primary_project: projectMeta.value.primary_project,
      project_type: projectMeta.value.project_type,
      source_url: projectMeta.value.source_url,
      console_endpoint_url: projectMeta.value.console_endpoint_url,
      app_id: projectMeta.value.app_id,
      ecosystem_id: projectMeta.value.ecosystem_id,
      firebase_project_id: projectMeta.value.firebase_project_id,
    }, {
      mode: props.mode,
    })

    if (props.mode === 'console') {
      setRuntimeProject({ projectId: result.id, mode: 'live' })
    }
    emit('created', result)

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
