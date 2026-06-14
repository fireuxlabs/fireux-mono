<template>
  <section>
    <ProviderGoQrTools
      tool="doc"
      :payload="tool"
      :auth-token="authToken"
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
const createEndpoint = computed(() =>
  `${appOrigin.value}/api/console/kitchen/menus/upload-source?${toolQuery.value}`
)
const availabilityEndpoint = computed(() =>
  `${appOrigin.value}/api/console/kitchen/menus/availability?${toolQuery.value}`
)
const tool = computed(() => ({
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
