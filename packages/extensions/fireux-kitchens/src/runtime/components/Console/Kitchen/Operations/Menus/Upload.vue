<template>
  <section>
    <ProviderGoQrDoc
      v-if="canUseTool"
      :tool="tool"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Choose a writable kitchen"
      description="The Go QR menu source tool is available after selecting a writable kitchen."
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
  canWrite,
} = useKitchenConsoleMenus()
const { currentUser } = useAuth()
const authToken = ref('')

const text = (value: unknown) => String(value ?? '').trim()
const kitchenSlug = computed(() => text((selectedKitchen.value as any)?.slug))
const appOrigin = computed(() =>
  import.meta.client ? window.location.origin : ''
)
const publicMenuPreviewBaseUrl = computed(() =>
  kitchenSlug.value
    ? `${appOrigin.value}/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus`
    : `${appOrigin.value}/kitchens`
)
const toolQuery = computed(() =>
  new URLSearchParams({
    appId: activeKitchenAppId.value,
    kitchenId: kitchenId.value,
  }).toString()
)
const canUseTool = computed(() =>
  canWrite.value &&
  Boolean(kitchenId.value && activeKitchenAppId.value && kitchenSlug.value && authToken.value)
)
const createEndpoint = computed(() =>
  `${appOrigin.value}/api/console/kitchen/menus/upload-source?${toolQuery.value}`
)
const availabilityEndpoint = computed(() =>
  `${appOrigin.value}/api/console/kitchen/menus/availability?${toolQuery.value}`
)
const tool = computed(() => ({
  authToken: authToken.value,
  copy: {
    title: 'Menu source',
    description: 'Upload a source menu PDF to this kitchen.',
    ctaLabel: 'Upload source',
    loadingLabel: 'Uploading source...',
    openTargetLabel: 'Open menu',
  },
  upload: {
    fileLabel: 'Menu PDF',
    accept: 'application/pdf,.pdf',
    hint: 'PDF. Max 10 MB.',
  },
  slug: {
    label: 'Menu id',
    placeholder: 'main-menu',
    takenMessage: 'This menu id already exists for this kitchen.',
  },
  preview: {
    baseUrl: publicMenuPreviewBaseUrl.value,
    pathSuffix: '',
  },
  endpoints: {
    create: createEndpoint.value,
    availability: availabilityEndpoint.value,
  },
}))

watch(currentUser, async (user) => {
  authToken.value = import.meta.client && user ? await user.getIdToken() : ''
}, { immediate: true })
</script>
