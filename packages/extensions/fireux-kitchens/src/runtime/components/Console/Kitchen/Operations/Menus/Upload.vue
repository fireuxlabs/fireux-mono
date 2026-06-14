<template>
  <section class="space-y-3">
    <ProviderGoQrTools
      tool="doc"
      :payload="tool"
      :auth-token="authToken"
      @tool-result="recordMenuUpload"
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
      :description="`Saved Go QR doc ${recordedUploadId} as a kitchen menu source.`"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const {
  kitchenId,
  activeKitchenAppId,
  selectedKitchen,
} = useKitchenConsoleMenus()
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
const defaultDocPath = computed(() =>
  [kitchenSlug.value, 'menu-source'].filter(Boolean).join('-') || 'menu-source'
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
    description: 'Upload the menu PDF with Go QR. Misebox will save it as this kitchen’s source document.',
    ctaLabel: 'Upload with Go QR',
    loadingLabel: 'Uploading with Go QR...',
    openTargetLabel: 'Open Go QR doc',
  },
  upload: {
    fileLabel: 'Menu document',
    accept: 'application/pdf,.pdf',
    hint: 'PDF. Max 10 MB.',
  },
  slug: {
    label: 'Go QR doc path',
    placeholder: defaultDocPath.value,
    takenMessage: 'This Go QR doc path is already taken.',
  },
}))

async function recordMenuUpload(message: Record<string, unknown>) {
  const result = message.result && typeof message.result === 'object'
    ? message.result as Record<string, unknown>
    : {}
  const providerDocId = text(result.id || result.slug)
  recordedUploadId.value = ''
  recordError.value = ''

  if (message.action !== 'created' || !providerDocId) return

  try {
    const response = await $fetch<{ id?: string }>(uploadSourceEndpoint.value, {
      method: 'POST',
      headers: authToken.value
        ? { authorization: `Bearer ${authToken.value}` }
        : undefined,
      body: {
        appId: activeKitchenAppId.value,
        kitchenId: kitchenId.value,
        provider: 'go-qr',
        tool: 'doc',
        result,
      },
    })

    recordedUploadId.value = text(response.id) || providerDocId
  } catch (error) {
    recordError.value = error instanceof Error
      ? error.message
      : 'Kitchen menu upload could not be saved.'
  }
}

watch(currentUser, async (user) => {
  authToken.value = import.meta.client && user ? await user.getIdToken() : ''
}, { immediate: true })
</script>
