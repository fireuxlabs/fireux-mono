<template>
  <div class="fx-plugin-surface">
    <div class="fx-plugin-surface__inner">
      <header
        v-if="tool"
        class="fx-plugin-surface__header"
      >
        <h2 class="fx-plugin-surface__title">
          {{ tool.ui.title }}
        </h2>
        <p class="fx-plugin-surface__description">
          {{ tool.ui.description }}
        </p>
      </header>

      <PublicQrFileUploadTool
        v-if="tool"
        :endpoint="tool.endpoints.create"
        config-endpoint="/api/menu-qr/config"
        :accept="tool.tool.accepts.join(',')"
        :upload-label="tool.ui.upload_label"
        :upload-description="tool.consumer_config?.uploadDescription"
        :cta-label="tool.ui.cta_label"
        :loading-label="tool.ui.loading_label"
        :slug-label="tool.slug.label"
        :slug-validation-label="tool.slug.validation_label"
        :slug-placeholder="tool.slug.placeholder"
        :preview-base-url="tool.preview.base_url"
        :preview-path-suffix="tool.preview.path_suffix"
        :availability-endpoint="tool.endpoints.availability"
        :taken-message="tool.slug.taken_message"
        :reserved-slugs="tool.slug.reserved"
        :max-file-size-mb="tool.tool.max_file_size_mb"
        :success-title="tool.ui.success_title"
        :open-target-label="tool.ui.open_target_label"
        :open-qr-label="tool.ui.open_qr_label"
        powered-by-endpoint="/api/menu-qr/brand"
      />

      <UCard
        v-else-if="pending"
        variant="subtle"
      >
        <div class="fx-plugin-surface__skeleton">
          <USkeleton class="h-5 w-2/3" />
          <USkeleton class="h-32 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>
      </UCard>

      <UAlert
        v-else
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="Menu QR tool unavailable"
        :description="toolErrorMessage"
      />

      <DevJson
        class="fx-plugin-surface__debug"
        :data="debugPayload"
        title="Misebox menu QR tool"
        context="Misebox-owned menu QR surface using the Go QR public-doc provider contract."
        :hide-when-empty="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type MenuQrToolContract = {
  ok: boolean
  provider: {
    id: string
    app_info_url: string
    base_url: string
  }
  tool: {
    id: string
    name: string
    upload_type: string
    accepts: string[]
    max_file_size_mb: number
    anonymous_max_creates: number
    result: {
      target_path_pattern: string
      qr_path_pattern: string
      label: string
    }
  }
  endpoints: {
    availability: string
    create: string
    app_info: string
  }
  slug: {
    label: string
    validation_label: string
    placeholder: string
    reserved: string[]
    taken_message: string
  }
  ui: {
    title: string
    description: string
    upload_label: string
    cta_label: string
    loading_label: string
    success_title: string
    open_target_label: string
    open_qr_label: string
  }
  preview: {
    base_url: string
    path_suffix: string
  }
  consumer_config?: {
    resourceName: string
    displayLabel: string
    qrCentreLabel: string
    slugPlaceholder: string
    description: string
    acceptedFileTypes: string[]
    uploadDescription: string
    storageOwner: 'misebox'
  }
}

const { data: tool, error, pending } = useAsyncData<MenuQrToolContract>(
  'misebox-menu-qr-tool',
  () => $fetch('/api/menu-qr/tool')
)

const toolErrorMessage = computed(() =>
  error.value?.message || 'The menu QR tool could not be loaded.'
)

const debugPayload = computed(() => ({
  consumerConfig: tool.value?.consumer_config || {
    resourceName: 'menu',
    displayLabel: 'Food Menu',
    qrCentreLabel: 'Menu',
    slugPlaceholder: 'my-restaurant-menu',
    description: 'Create a scannable Food Menu QR page from a finished menu file.',
    acceptedFileTypes: ['application/pdf', '.doc', '.docx'],
    uploadDescription: 'PDF, DOC, or DOCX. Max 10 MB.',
    storageOwner: 'misebox',
  },
  providerResolution: {
    providerId: tool.value?.provider.id || 'go-qr',
    providerBaseUrl: tool.value?.provider.base_url || null,
    providerTool: tool.value?.tool.id || 'public-doc',
    providerUploadType: tool.value?.tool.upload_type || 'doc',
    providerOwnsUploadType: true,
  },
  endpoints: {
    tool: '/api/menu-qr/tool',
    config: '/api/menu-qr/config',
    create: tool.value?.endpoints.create || '/api/menus',
    availability: tool.value?.endpoints.availability || '/api/menu-qr/availability',
    brand: tool.value?.endpoints.app_info || '/api/menu-qr/brand',
  },
  state: {
    pending: pending.value,
    error: error.value?.message || null,
  },
}))
</script>
