<template>
  <UCard
    class="w-full max-w-xl"
    variant="subtle"
  >
    <template #header>
      <div class="flex items-start gap-3">
        <img
          :src="tool.provider.logoUrl"
          alt="Go QR"
          class="size-10 rounded-md"
        >
        <div class="min-w-0 space-y-1">
          <p class="text-xs font-medium uppercase text-muted">
            {{ tool.provider.name }}
          </p>
          <h2 class="text-lg font-semibold text-highlighted">
            {{ tool.ui.title }}
          </h2>
          <p class="text-sm leading-6 text-muted">
            {{ tool.ui.description }}
          </p>
        </div>
      </div>
    </template>

    <GoQrToolFileUpload
      v-if="canImport"
      :tool="tool"
      navigate-on-success
      :show-powered-by="false"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a public kitchen"
      description="Choose a writable kitchen with a public slug before creating a menu."
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenus } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'

const { kitchenId, selectedKitchen, canWrite } = useKitchenConsoleMenus()
const encodedKitchenId = computed(() => encodeURIComponent(kitchenId.value))
const kitchenSlug = computed(() =>
  String((selectedKitchen.value as any)?.slug || '').trim()
)
const canImport = computed(() =>
  Boolean(canWrite.value && kitchenId.value && kitchenSlug.value)
)
const previewBaseUrl = computed(() =>
  `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus`
)
const consoleMenuToolEndpoint = (action: 'availability' | 'config' | 'create') =>
  `/api/console/kitchen/menus/${encodedKitchenId.value}/${action}`
const tool = computed(() => ({
  provider: {
    name: 'Go QR',
    logoUrl: 'https://go-qr.web.app/img/app/logo.svg',
  },
  ui: {
    title: 'Menu',
    description: 'Upload a menu, choose a short path, and create a kitchen-owned menu.',
    upload_label: 'Upload your menu',
    upload_description: 'PDF, DOC, or DOCX. Max 10 MB.',
    cta_label: 'Create menu',
    loading_label: 'Creating menu...',
    success_title: 'Menu created',
    open_target_label: 'Open menu',
    open_qr_label: 'Open menu',
  },
  tool: {
    id: 'doc',
    upload_type: 'doc',
    accepts: ['application/pdf', '.doc', '.docx'],
    max_file_size_mb: 10,
  },
  endpoints: {
    create: consoleMenuToolEndpoint('create'),
    availability: consoleMenuToolEndpoint('availability'),
  },
  slug: {
    label: 'Menu path',
    validation_label: 'Menu path',
    placeholder: 'dinner-menu',
    reserved: ['create', 'edit', 'index', 'new', 'qr', 'sections'],
    taken_message: 'This menu path is already taken.',
  },
  preview: {
    base_url: previewBaseUrl.value,
    path_suffix: '',
  },
  result_base_url: import.meta.client ? window.location.origin : '',
}))
</script>
