<template>
  <section>
    <ProviderGoQrDoc
      v-if="canUseTool"
      title="Menu source"
      description="Upload a source menu PDF to this kitchen."
      file-label="Menu PDF"
      path-label="Menu id"
      slug-placeholder="main-menu"
      :preview-base-url="`${consumerBaseUrl}/console/kitchen/menus`"
      preview-path-suffix=""
      :create-endpoint="createEndpoint"
      :availability-endpoint="availabilityEndpoint"
      accept="application/pdf,.pdf"
      upload-hint="PDF. Max 10 MB."
      cta-label="Upload source"
      loading-label="Uploading source..."
      open-target-label="Open menu"
      taken-message="This menu id already exists for this kitchen."
      :auth-token="authToken"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Choose a writable live kitchen"
      description="The Go QR menu source tool is available after selecting a live kitchen."
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleMenus } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'

const {
  selectedMode,
  kitchenId,
  activeKitchenAppId,
  canWrite,
} = useKitchenConsoleMenus()
const { currentUser } = useAuth()
const authToken = ref('')

const consumerBaseUrl = computed(() =>
  import.meta.client ? window.location.origin : ''
)
const toolQuery = computed(() =>
  new URLSearchParams({
    appId: activeKitchenAppId.value,
    kitchenId: kitchenId.value,
  }).toString()
)
const canUseTool = computed(() =>
  selectedMode.value === 'live' &&
  canWrite.value &&
  Boolean(kitchenId.value && activeKitchenAppId.value && authToken.value)
)
const createEndpoint = computed(() =>
  `${consumerBaseUrl.value}/api/console/kitchen/menus/upload-source?${toolQuery.value}`
)
const availabilityEndpoint = computed(() =>
  `${consumerBaseUrl.value}/api/console/kitchen/menus/availability?${toolQuery.value}`
)

watch(currentUser, async (user) => {
  authToken.value = import.meta.client && user ? await user.getIdToken() : ''
}, { immediate: true })
</script>
