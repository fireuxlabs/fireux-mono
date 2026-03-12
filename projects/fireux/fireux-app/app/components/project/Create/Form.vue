<template>
  <div class="space-y-4">
    <UFormGroup
      label="FireUX console endpoint"
      required
      description="Use the app URL or the full /api/fireux-console endpoint."
    >
      <div class="flex flex-wrap gap-2">
        <UInput
          v-model="endpointUrl"
          class="flex-1 min-w-[18rem]"
          placeholder="https://misebox.app or https://misebox.app/api/fireux-console"
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
      :description="`${projectMeta.project_type} · ${projectMeta.app_id} · ${projectMeta.ecosystem_id}`"
    />

    <UFormGroup label="Project name" required>
      <UInput
        v-model="name"
        placeholder="FireUX Platform"
        autofocus
      />
    </UFormGroup>

    <UFormGroup label="Description">
      <UTextarea
        v-model="description"
        :rows="4"
        placeholder="Short description of this FireUX project."
      />
    </UFormGroup>

    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
    </div>

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

type ProjectMetaPayload = {
  project: {
    id: string
    name: string
    description: string
    slug: string
  }
  app: {
    id: string
    name: string
  }
  ecosystem: {
    id: string
  }
  runtime: {
    project_type: FireuxProjectType
    source_url: string
    console_endpoint_url: string
    firebase_project_id: string
  }
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
const name = ref('')
const description = ref('')
const submitting = ref(false)
const error = ref('')

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

function readProjectMeta(payload: unknown) {
  const next = payload as ProjectMetaPayload | null
  if (!next?.project || !next.app || !next.ecosystem || !next.runtime) {
    throw new Error('Project endpoint did not return the required console data')
  }

  const name = String(next.project.name || '').trim()
  const description = String(next.project.description || '').trim()
  const slug = String(next.project.slug || '').trim()
  const projectType = String(next.runtime.project_type || '').trim() as FireuxProjectType
  const sourceUrl = String(next.runtime.source_url || '').trim()
  const consoleEndpointUrl = String(next.runtime.console_endpoint_url || '').trim()
  const appId = String(next.app.id || '').trim()
  const ecosystemId = String(next.ecosystem.id || '').trim()
  const firebaseProjectId = String(next.runtime.firebase_project_id || '').trim()

  if (!name || !slug || !projectType || !sourceUrl || !consoleEndpointUrl || !appId || !ecosystemId || !firebaseProjectId) {
    throw new Error('Project endpoint returned incomplete project metadata')
  }

  return {
    name,
    description,
    slug,
    project_type: projectType,
    source_url: sourceUrl,
    console_endpoint_url: consoleEndpointUrl,
    app_id: appId,
    ecosystem_id: ecosystemId,
    firebase_project_id: firebaseProjectId,
  }
}

const fetchProjectMeta = async () => {
  if (fetchingMeta.value) return

  fetchingMeta.value = true
  error.value = ''

  try {
    const normalizedUrl = normalizeFireuxConsoleEndpoint(endpointUrl.value)
    const response = await fetch(normalizedUrl)
    if (!response.ok) {
      throw new Error(`Project endpoint returned ${response.status}`)
    }

    const payload = await response.json()
    const nextMeta = readProjectMeta(payload)

    endpointUrl.value = normalizedUrl
    projectMeta.value = nextMeta
    name.value = nextMeta.name
    description.value = nextMeta.description
  } catch (err) {
    projectMeta.value = null
    error.value =
      err instanceof Error ? err.message : 'Unable to fetch project metadata'
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
      name: name.value,
      slug: projectMeta.value.slug,
      description: description.value,
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
