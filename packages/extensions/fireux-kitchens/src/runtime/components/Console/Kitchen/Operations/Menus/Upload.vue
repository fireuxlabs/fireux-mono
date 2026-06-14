<template>
  <section class="space-y-3">
    <ProviderGoQrTools
      v-if="canUseTool"
      tool="doc"
      :payload="tool"
      :auth-token="authToken"
      @tool-result="handleMenuUploadResult"
    />

    <UAlert
      v-else
      color="warning"
      variant="soft"
      title="Menu source upload is not ready"
      :description="missingContextMessage"
    />

    <UAlert
      v-if="recordError"
      color="error"
      variant="soft"
      title="Menu upload was not saved"
      :description="recordError"
    />

    <UAlert
      v-else-if="recordedUploadId"
      color="success"
      variant="soft"
      title="Menu upload saved"
      :description="`Saved ${recordedUploadId} as a kitchen menu source in ${activeKitchenAppId}.`"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const {
  kitchenId,
  activeKitchenAppId,
  selectedKitchen,
} = useKitchenConsoleMenus()
const { appId } = useFireUXConfig()
const { currentUser } = useAuth()
const authToken = ref('')
const recordedUploadId = ref('')
const recordError = ref('')

const text = (value: unknown) => String(value ?? '').trim()
const kitchenSlug = computed(() => text((selectedKitchen.value as any)?.slug))
const appOrigin = computed(() =>
  import.meta.client ? window.location.origin : ''
)
const uploadSourceEndpoint = computed(() =>
  `${appOrigin.value}/api/console/kitchen/menus/upload-source?${new URLSearchParams({
    appId: activeKitchenAppId.value,
    kitchenId: kitchenId.value,
  }).toString()}`
)
const uploadSourceAvailabilityEndpoint = computed(() =>
  `${appOrigin.value}/api/console/kitchen/menus/upload-source/availability?${new URLSearchParams({
    appId: activeKitchenAppId.value,
    kitchenId: kitchenId.value,
  }).toString()}`
)
const defaultDocPath = computed(() =>
  kitchenSlug.value ? `${kitchenSlug.value}-menu-source` : ''
)
const canUseTool = computed(() =>
  Boolean(
    activeKitchenAppId.value &&
    activeKitchenAppId.value === appId &&
    kitchenId.value &&
    defaultDocPath.value
  )
)
const missingContextMessage = computed(() => {
  if (!activeKitchenAppId.value) return 'Select a kitchen app before uploading a menu source.'
  if (activeKitchenAppId.value !== appId) {
    return `This kitchen is owned by ${activeKitchenAppId.value}. Open that app to upload its menu source.`
  }

  if (!kitchenId.value) return 'Select a kitchen before uploading a menu source.'
  if (!kitchenSlug.value) return 'This kitchen needs a public slug before uploading a menu source.'

  return 'Menu source upload needs a selected kitchen before it can start.'
}
)
const tool = computed(() => ({
  consumer: {
    kitchen: {
      id: kitchenId.value,
      slug: kitchenSlug.value,
    },
  },
  copy: {
    title: 'Step 1: Upload menu source',
    description: 'Go QR provides the upload tool. The selected kitchen app stores the source document.',
    ctaLabel: 'Save source document',
    loadingLabel: 'Saving source document...',
    openTargetLabel: 'Open stored file',
  },
  upload: {
    fileLabel: 'Menu document',
    accept: 'application/pdf,.pdf',
    hint: 'PDF. Max 10 MB.',
  },
  slug: {
    label: 'Menu source path',
    placeholder: defaultDocPath.value,
    initialValue: defaultDocPath.value,
    takenMessage: 'This menu source path is already taken.',
  },
  preview: {
    message: `Stored by ${activeKitchenAppId.value} as a kitchen menu source.`,
  },
  endpoints: {
    create: uploadSourceEndpoint.value,
    availability: uploadSourceAvailabilityEndpoint.value,
  },
}))

function handleMenuUploadResult(message: Record<string, unknown>) {
  const result = message.result && typeof message.result === 'object'
    ? message.result as Record<string, unknown>
    : {}
  const uploadId = text(result.id || result.slug)
  recordedUploadId.value = ''
  recordError.value = ''

  if (message.action !== 'created' || !uploadId) return
  if (!canUseTool.value) {
    recordError.value = missingContextMessage.value
    return
  }

  recordedUploadId.value = uploadId
}

watch(currentUser, async (user) => {
  authToken.value = import.meta.client && user ? await user.getIdToken() : ''
}, { immediate: true })
</script>
