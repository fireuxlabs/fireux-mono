<template>
  <section class="space-y-3">
    <ProviderGoQrTools
      v-if="canUseTool"
      tool="doc"
      :payload="payload"
      :auth-token="authToken"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const { appId } = useFireUXConfig()
const { currentUser } = useAuth()
const { selectedKitchen, kitchenId, activeKitchenAppId } =
  useKitchenConsoleMenus()
const { app: storageApp } = useAppFetch(activeKitchenAppId)
const authToken = ref('')

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const kitchenSlug = computed(() =>
  normalizeSlug(
    text((selectedKitchen.value as Record<string, unknown> | null)?.slug) ||
      text((selectedKitchen.value as Record<string, unknown> | null)?.name) ||
      kitchenId.value
  )
)
const sourcePath = computed(() =>
  kitchenSlug.value ? `${kitchenSlug.value}-menu-source` : ''
)
const currentOrigin = computed(() =>
  import.meta.client ? origin(window.location.origin) : ''
)
const storageAppOrigin = computed(() => {
  if (!activeKitchenAppId.value) return ''
  if (activeKitchenAppId.value === appId) return currentOrigin.value

  const appRecord = record(storageApp.value)
  const socialLinks = record(appRecord.social_links)

  return origin(socialLinks.website) || origin(appRecord.source_url)
})
const endpointOrigin = computed(() =>
  import.meta.dev ? currentOrigin.value : storageAppOrigin.value
)
const endpointQuery = computed(() => {
  if (!activeKitchenAppId.value || !kitchenId.value) return ''

  return new URLSearchParams({
    appId: activeKitchenAppId.value,
    kitchenId: kitchenId.value,
  }).toString()
})
const createEndpoint = computed(() =>
  endpointOrigin.value && endpointQuery.value
    ? `${endpointOrigin.value}/api/console/kitchen/menus/upload-source?${endpointQuery.value}`
    : ''
)
const availabilityEndpoint = computed(() =>
  endpointOrigin.value && endpointQuery.value
    ? `${endpointOrigin.value}/api/console/kitchen/menus/upload-source/availability?${endpointQuery.value}`
    : ''
)
const canUseTool = computed(() =>
  Boolean(
    activeKitchenAppId.value &&
      kitchenId.value &&
      sourcePath.value &&
      createEndpoint.value &&
      availabilityEndpoint.value
  )
)
const storageAppLabel = computed(() =>
  activeKitchenAppId.value || 'the selected kitchen app'
)
const payload = computed(() => ({
  consumer: {
    kitchen: {
      id: kitchenId.value,
      slug: kitchenSlug.value,
    },
    storage: {
      appId: activeKitchenAppId.value,
      origin: storageAppOrigin.value,
      endpointOrigin: endpointOrigin.value,
    },
  },
  copy: {
    title: 'Step 1: Upload menu source',
    description: 'Upload the original menu PDF so the owning app can store it against this kitchen.',
    ctaLabel: 'Upload menu source',
    loadingLabel: 'Uploading menu source...',
    openTargetLabel: 'Open uploaded menu source',
  },
  upload: {
    fileLabel: 'Menu document',
    accept: 'application/pdf,.pdf',
    hint: 'Upload the original menu PDF.',
  },
  slug: {
    label: 'Menu source path',
    placeholder: sourcePath.value,
    initialValue: sourcePath.value,
    takenMessage: 'This menu source path is already taken.',
  },
  preview: {
    message: `This source document will be stored by ${storageAppLabel.value}. Dishes, menus, and translations come later.`,
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
