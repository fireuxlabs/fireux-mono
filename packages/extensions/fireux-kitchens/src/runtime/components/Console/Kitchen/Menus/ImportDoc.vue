<template>
  <UCard
    class="w-full max-w-xl"
    variant="subtle"
  >
    <template #header>
      <div class="flex items-start gap-3">
        <img
          src="https://go-qr.web.app/img/app/logo.svg"
          alt="Go QR"
          class="size-10 rounded-md"
        >
        <div class="min-w-0 space-y-1">
          <p class="text-xs font-medium uppercase text-muted">
            Go QR
          </p>
          <h2 class="text-lg font-semibold text-highlighted">
            Import menu document
          </h2>
          <p class="text-sm leading-6 text-muted">
            Upload a menu, choose a short path, and start a kitchen-owned menu.
          </p>
        </div>
      </div>
    </template>

    <PublicQrFileUploadTool
      v-if="canWrite && kitchenId"
      :endpoint="endpoint"
      :config-endpoint="configEndpoint"
      accept="application/pdf,.doc,.docx"
      upload-label="Upload your menu"
      upload-description="PDF, DOC, or DOCX. Max 10 MB."
      cta-label="Import menu"
      loading-label="Importing menu..."
      slug-label="Menu path"
      slug-validation-label="Menu path"
      slug-placeholder="dinner-menu"
      :preview-base-url="previewBaseUrl"
      preview-path-suffix=""
      :result-base-url="resultBaseUrl"
      :availability-endpoint="availabilityEndpoint"
      taken-message="This menu path is already taken."
      :reserved-slugs="reservedSlugs"
      :max-file-size-mb="10"
      success-title="Menu document imported"
      open-target-label="Open menu"
      open-qr-label="Open menu"
      navigate-on-success
      :show-powered-by="false"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a writable kitchen"
      description="Choose a live kitchen before importing a menu document."
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenus } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'

const { kitchenId, selectedKitchen, canWrite } = useKitchenConsoleMenus()
const encodedKitchenId = computed(() => encodeURIComponent(kitchenId.value))
const endpoint = computed(() => `/api/console/kitchen/menus/${encodedKitchenId.value}/create`)
const availabilityEndpoint = computed(() => `/api/console/kitchen/menus/${encodedKitchenId.value}/availability`)
const configEndpoint = computed(() => `/api/console/kitchen/menus/${encodedKitchenId.value}/config`)
const kitchenSlug = computed(() =>
  String((selectedKitchen.value as any)?.slug || selectedKitchen.value?.id || '').trim()
)
const previewBaseUrl = computed(() =>
  kitchenSlug.value
    ? `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus`
    : '/kitchens'
)
const resultBaseUrl = computed(() => import.meta.client ? window.location.origin : '')
const reservedSlugs = [
  'create',
  'edit',
  'index',
  'new',
  'qr',
  'sections',
]
</script>
