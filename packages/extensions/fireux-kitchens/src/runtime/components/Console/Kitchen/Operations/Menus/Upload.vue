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
      :title="blockedTitle"
      :description="blockedDescription"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { useKitchenPublicMenuUrl } from '../../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuUrl'

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
const publicMenuUrl = useKitchenPublicMenuUrl({
  appId: activeKitchenAppId,
  kitchenSlug,
})
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
const blockedTitle = computed(() => {
  if (!canWrite.value) return 'Menu upload is read only'
  if (!kitchenId.value) return 'Select a kitchen'
  if (!activeKitchenAppId.value) return 'Missing app scope'
  if (!kitchenSlug.value) return 'Kitchen slug required'
  if (!authToken.value) return 'Signing in'
  return 'Menu source unavailable'
})
const blockedDescription = computed(() => {
  if (!canWrite.value) {
    return 'Only kitchen operators can upload menu source documents.'
  }

  if (!kitchenId.value) {
    return 'Choose a kitchen before uploading a menu source document.'
  }

  if (!activeKitchenAppId.value) {
    return 'This selected kitchen needs an app scope before menu sources can be stored.'
  }

  if (!kitchenSlug.value) {
    return 'The selected kitchen needs a public slug before menu preview links can be created.'
  }

  if (!authToken.value) {
    return 'Waiting for your signed-in session before enabling upload.'
  }

  return 'The menu source upload tool is not available for this kitchen yet.'
})
const createEndpoint = computed(() =>
  `${appOrigin.value}/api/console/kitchen/menus/upload-source?${toolQuery.value}`
)
const availabilityEndpoint = computed(() =>
  `${appOrigin.value}/api/console/kitchen/menus/availability?${toolQuery.value}`
)
const tool = computed(() => ({
  authToken: authToken.value,
  copy: {
    title: 'Step 1: Upload menu source',
    description: 'Upload the menu PDF as a source document for this kitchen.',
    ctaLabel: 'Upload menu source',
    loadingLabel: 'Uploading menu source...',
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
    baseUrl: publicMenuUrl.menuIndexUrl.value,
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
