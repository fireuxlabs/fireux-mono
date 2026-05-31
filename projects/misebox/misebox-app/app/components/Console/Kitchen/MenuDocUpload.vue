<template>
  <AppToolFoldaway
    title="Add menu document"
    description="Upload a finished PDF, DOC, or DOCX to this kitchen."
    provider="Go QR"
    :open="open"
  >
    <UAlert
      v-if="!canWrite || !kitchenId"
      color="neutral"
      variant="soft"
      title="Select a writable kitchen"
      description="Choose a live kitchen before adding a menu document."
    />

    <ProviderGoQrDocTool
      v-else
      title="Menu"
      description="Upload a finished menu document for this kitchen and get a QR-ready menu."
      file-label="Menu file"
      path-label="Menu path"
      slug-placeholder="dinner-menu"
      :preview-base-url="previewBaseUrl"
      preview-path-suffix=""
      :create-endpoint="createEndpoint"
      :availability-endpoint="availabilityEndpoint"
      accept="application/pdf,.doc,.docx"
      upload-hint="PDF, DOC, or DOCX. Max 10 MB."
      cta-label="Add menu document"
      loading-label="Adding menu..."
      open-target-label="Open menu"
      taken-message="This menu path is already taken."
    />
  </AppToolFoldaway>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenus } from 'fireux-kitchens/runtime/composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'

const { kitchenId, selectedKitchen, canWrite } = useKitchenConsoleMenus()

withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: false,
})

const kitchenSlug = computed(() => String((selectedKitchen.value as any)?.slug || '').trim())
const appBaseUrl = computed(() =>
  import.meta.client ? window.location.origin : 'https://misebox.app'
)
const previewBaseUrl = computed(() =>
  kitchenSlug.value
    ? `${appBaseUrl.value}/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus`
    : `${appBaseUrl.value}/kitchens/{kitchen}/menus`
)
const encodedKitchenId = computed(() => encodeURIComponent(kitchenId.value || ''))
const availabilityEndpoint = computed(() =>
  `${appBaseUrl.value}/api/console/kitchen/menus/${encodedKitchenId.value}/availability`
)
const createEndpoint = computed(() =>
  `${appBaseUrl.value}/api/console/kitchen/menus/${encodedKitchenId.value}/create`
)
</script>
