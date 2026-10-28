<template>
  <GoQrProviderFrame
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/doc"
  >
    <ClientOnly>
      <form class="space-y-4" @submit.prevent="createDoc">
        <UFormField :label="fileLabel">
          <UFileUpload
            v-model="selectedFile"
            :accept="accept"
            :multiple="allowMultipleFiles"
            variant="area"
            size="xl"
            class="w-full"
          />
          <p class="mt-1 text-xs text-muted">
            {{ uploadHint }}
          </p>
        </UFormField>

        <UFormField :label="pathLabel">
          <UInput
            v-model="slugInput"
            :placeholder="slugPlaceholder"
            :disabled="slugLocked"
            class="w-full"
          />
          <p class="mt-1 break-all text-xs text-muted">
            {{ previewUrl }}
          </p>
          <p
            v-if="slugMessage"
            class="mt-1 text-xs"
            :class="canUseSlug ? 'text-muted' : 'text-error'"
          >
            {{ slugMessage }}
          </p>
        </UFormField>

        <UButton
          type="submit"
          icon="i-lucide-qr-code"
          block
          :disabled="!canCreate"
          :loading="isCreating"
        >
          {{ isCreating ? loadingLabel : ctaLabel }}
        </UButton>

        <p v-if="createError" class="text-xs text-error">
          {{ createError }}
        </p>
      </form>

      <div v-if="createdPath" class="flex flex-wrap gap-2">
        <UButton
          v-if="createdPath"
          :to="createdPath"
          target="_blank"
          icon="i-lucide-external-link"
        >
          {{ openTargetLabel }}
        </UButton>
        <UButton
          v-if="createdQrPath"
          :to="createdQrPath"
          target="_blank"
          icon="i-lucide-qr-code"
          variant="soft"
        >
          Open QR
        </UButton>
      </div>

      <template #fallback>
        <UCard variant="subtle" class="rounded-lg">
          <p class="text-sm text-dimmed">Loading menu upload...</p>
        </UCard>
      </template>
    </ClientOnly>
  </GoQrProviderFrame>
</template>

<script setup lang="ts">
import { refreshNuxtData } from 'nuxt/app'

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type DocToolConfig = {
  copy?: {
    title?: string
    description?: string
    ctaLabel?: string
    loadingLabel?: string
    openTargetLabel?: string
  }
  upload?: {
    fileLabel?: string
    accept?: string
    hint?: string
    multiple?: boolean
  }
  slug?: {
    label?: string
    placeholder?: string
    initialValue?: string
    takenMessage?: string
    locked?: boolean
  }
  preview?: {
    baseUrl?: string
    pathSuffix?: string
    message?: string
  }
  endpoints?: {
    create?: string
    availability?: string
  }
}

const props = withDefaults(
  defineProps<{
    tool?: DocToolConfig | null
  }>(),
  {
    tool: null,
  }
)

const selectedFile = ref<File | File[] | null>(null)
const slugInput = ref('')
const appliedInitialSlug = ref('')
const slugTaken = ref(false)
const slugError = ref('')
const isCreating = ref(false)
const createError = ref('')
const createdPath = ref('')
const createdQrPath = ref('')
const authToken = ref('')
const parentOrigin = ref('')
let authRequestResolve: ((token: string) => void) | null = null

const files = computed(() =>
  Array.isArray(selectedFile.value)
    ? selectedFile.value.filter(Boolean)
    : selectedFile.value
      ? [selectedFile.value]
      : []
)
const configuredText = (value: unknown) => String(value ?? '').trim()
const toolTitle = computed(() => configuredText(props.tool?.copy?.title))
const toolDescription = computed(() =>
  configuredText(props.tool?.copy?.description)
)
const fileLabel = computed(() => configuredText(props.tool?.upload?.fileLabel))
const pathLabel = computed(() => configuredText(props.tool?.slug?.label))
const slugPlaceholder = computed(() =>
  configuredText(props.tool?.slug?.placeholder)
)
const slugInitialValue = computed(() =>
  configuredText(props.tool?.slug?.initialValue)
)
const slugLocked = computed(() => Boolean(props.tool?.slug?.locked))
const accept = computed(() => configuredText(props.tool?.upload?.accept))
const allowMultipleFiles = computed(
  () => props.tool?.upload?.multiple !== false
)
const uploadHint = computed(() => configuredText(props.tool?.upload?.hint))
const ctaLabel = computed(() => configuredText(props.tool?.copy?.ctaLabel))
const loadingLabel = computed(() =>
  configuredText(props.tool?.copy?.loadingLabel)
)
const openTargetLabel = computed(() =>
  configuredText(props.tool?.copy?.openTargetLabel)
)
const takenMessage = computed(() =>
  configuredText(props.tool?.slug?.takenMessage)
)
const normalizedSlug = computed(() =>
  slugInput.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
)
const previewBaseUrl = computed(() =>
  configuredText(props.tool?.preview?.baseUrl)
)
const previewMessage = computed(() =>
  configuredText(props.tool?.preview?.message)
)
const previewPathSuffix = computed(() =>
  configuredText(props.tool?.preview?.pathSuffix)
)
const previewUrl = computed(() => {
  if (previewMessage.value) return previewMessage.value
  if (!normalizedSlug.value || !previewBaseUrl.value) return ''

  return `${previewBaseUrl.value}/${normalizedSlug.value}${previewPathSuffix.value}`
})
const availabilityEndpoint = computed(() =>
  configuredText(props.tool?.endpoints?.availability)
)
const createEndpoint = computed(() =>
  configuredText(props.tool?.endpoints?.create)
)
const canUseSlug = computed(() =>
  Boolean(normalizedSlug.value && !slugTaken.value && !slugError.value)
)
const slugMessage = computed(() => {
  if (slugError.value) return slugError.value
  if (slugTaken.value) return takenMessage.value
  return ''
})
const canCreate = computed(() =>
  Boolean(files.value.length && canUseSlug.value && !isCreating.value)
)

watch(slugInput, async () => {
  const slug = normalizedSlug.value
  slugTaken.value = false
  slugError.value = ''
  createdPath.value = ''
  createdQrPath.value = ''

  if (!slug) return

  try {
    const token = await requestToolAuth()
    const response = await $fetch<{
      taken?: boolean
      is_valid?: boolean
      message?: string
    }>(availabilityEndpoint.value, {
      query: { id: slug },
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })

    slugTaken.value = Boolean(response.taken)
    slugError.value =
      response.is_valid === false ? configuredText(response.message) : ''
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : ''
  }
})

watch(
  slugInitialValue,
  (value) => {
    if (!value) return
    if (slugInput.value && slugInput.value !== appliedInitialSlug.value) return

    slugInput.value = value
    appliedInitialSlug.value = value
  },
  { immediate: true }
)

onMounted(() => {
  parentOrigin.value = resolveParentOrigin()
  window.addEventListener('message', handleToolAuthMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleToolAuthMessage)
})

function handleToolAuthMessage(event: MessageEvent) {
  if (event.source !== window.parent) return
  if (event.data?.source !== 'fireux-tool-iframe') return
  if (event.origin) parentOrigin.value = event.origin
  if (event.data?.type !== 'tool-auth') return

  const token = typeof event.data.token === 'string' ? event.data.token : ''
  authToken.value = token
  authRequestResolve?.(token)
  authRequestResolve = null
}

function requestToolAuth() {
  if (!import.meta.client || window.parent === window)
    return Promise.resolve(authToken.value)
  if (authToken.value) return Promise.resolve(authToken.value)
  const targetOrigin = parentOrigin.value || resolveParentOrigin()
  if (!targetOrigin) return Promise.resolve(authToken.value)

  return new Promise<string>((resolve) => {
    authRequestResolve = resolve
    window.parent.postMessage(
      {
        source: 'go-qr',
        tool: 'doc',
        type: 'tool-auth-request',
      },
      targetOrigin
    )

    window.setTimeout(() => {
      if (!authRequestResolve) return
      authRequestResolve = null
      resolve(authToken.value)
    }, 700)
  })
}

async function createDoc() {
  if (!canCreate.value || !files.value.length) return

  isCreating.value = true
  createError.value = ''
  createdPath.value = ''
  createdQrPath.value = ''

  try {
    const form = new FormData()
    form.append('slug', normalizedSlug.value)
    for (const selected of files.value) {
      form.append('file', selected)
    }
    const token = await requestToolAuth()

    const response = await $fetch<{
      path?: string
      qr_path?: string
      url?: string
      qr_url?: string
    }>(createEndpoint.value, {
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
      body: form,
    })

    createdPath.value = response.url || response.path || ''
    createdQrPath.value = response.qr_url || response.qr_path || ''
    notifyToolResult(response)
  } catch (error) {
    createError.value = error instanceof Error ? error.message : ''
  } finally {
    isCreating.value = false
  }
}

function notifyToolResult(result: Record<string, unknown>) {
  if (!import.meta.client || window.parent === window) return
  const targetOrigin = parentOrigin.value || resolveParentOrigin()
  if (!targetOrigin) return

  window.parent.postMessage(
    {
      source: 'go-qr',
      tool: 'doc',
      type: 'tool-result',
      action: 'created',
      result,
    },
    targetOrigin
  )
}

function resolveParentOrigin() {
  if (!import.meta.client) return ''

  try {
    return document.referrer ? new URL(document.referrer).origin : ''
  } catch {
    return ''
  }
}
</script>
