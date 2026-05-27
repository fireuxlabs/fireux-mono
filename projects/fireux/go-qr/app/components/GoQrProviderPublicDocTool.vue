<template>
  <div class="fx-plugin-surface">
    <div class="fx-plugin-surface__inner">
    <header
      v-if="tool"
      class="fx-plugin-surface__header"
    >
      <h2 class="fx-plugin-surface__title">
        {{ effectiveTitle }}
      </h2>
      <p
        v-if="effectiveDescription"
        class="fx-plugin-surface__description"
      >
        {{ effectiveDescription }}
      </p>
    </header>

    <PublicQrFileUploadTool
      v-if="tool"
      :endpoint="client.resolveUrl(tool.endpoints.create)"
      :config-endpoint="client.resolveUrl('/api/tools/public-doc/config')"
      :upload-label="effectiveUploadLabel"
      :cta-label="effectiveCtaLabel"
      :loading-label="effectiveLoadingLabel"
      :slug-label="effectiveSlugLabel"
      :slug-validation-label="effectiveSlugValidationLabel"
      :slug-placeholder="effectiveSlugPlaceholder"
      :preview-base-url="tool.preview.base_url"
      :preview-path-suffix="tool.preview.path_suffix"
      :availability-endpoint="client.resolveUrl(tool.endpoints.availability)"
      :taken-message="tool.slug.taken_message"
      :reserved-slugs="tool.slug.reserved"
      :max-file-size-mb="tool.tool.max_file_size_mb"
      :success-title="effectiveSuccessTitle"
      :open-target-label="effectiveOpenTargetLabel"
      :open-qr-label="tool.ui.open_qr_label"
      navigate-on-success
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
      title="QR tool unavailable"
      :description="toolErrorMessage"
    />

    <DevJson
      class="fx-plugin-surface__debug"
      :data="debugPayload"
      title="Go QR public-doc plugin"
      context="Provider contract, resolved endpoints, and local consumer overrides."
      :hide-when-empty="false"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createGoQrClient, type GoQrToolContract } from '../utils/goQrProviderClient'

const props = withDefaults(defineProps<{
  providerBaseUrl?: string
  resourceLabel?: string
  title?: string
  description?: string
  slugPlaceholder?: string
}>(), {
  providerBaseUrl: '',
  resourceLabel: '',
  title: '',
  description: '',
  slugPlaceholder: '',
})

const client = createGoQrClient({ baseUrl: props.providerBaseUrl })
const { data: tool, error, pending } = useAsyncData<GoQrToolContract>(
  `go-qr-public-doc-tool:${props.providerBaseUrl || 'self'}`,
  () => client.publicDoc.config()
)

const toolErrorMessage = computed(() =>
  error.value?.message || 'The Go QR provider contract could not be loaded.'
)

const normalizedResourceLabel = computed(() =>
  (props.resourceLabel || tool.value?.tool.result.label || 'doc').trim()
)
const sentenceResourceLabel = computed(() => normalizedResourceLabel.value.toLowerCase())
const hasResourceOverride = computed(() => Boolean(props.resourceLabel.trim()))
const effectiveTitle = computed(() =>
  props.title || tool.value?.ui.title || `Upload a ${sentenceResourceLabel.value}. Get a QR code.`
)
const effectiveDescription = computed(() =>
  props.description || tool.value?.ui.description || ''
)
const effectiveUploadLabel = computed(() =>
  hasResourceOverride.value ? `Upload your ${sentenceResourceLabel.value}` : tool.value?.ui.upload_label || `Upload your ${sentenceResourceLabel.value}`
)
const effectiveCtaLabel = computed(() =>
  hasResourceOverride.value ? `Create ${sentenceResourceLabel.value} QR` : tool.value?.ui.cta_label || `Create ${sentenceResourceLabel.value} QR`
)
const effectiveLoadingLabel = computed(() =>
  hasResourceOverride.value ? `Creating ${sentenceResourceLabel.value} QR...` : tool.value?.ui.loading_label || `Creating ${sentenceResourceLabel.value} QR...`
)
const effectiveSlugLabel = computed(() =>
  hasResourceOverride.value ? `${normalizedResourceLabel.value} path` : tool.value?.slug.label || `${normalizedResourceLabel.value} path`
)
const effectiveSlugValidationLabel = computed(() =>
  hasResourceOverride.value ? `${normalizedResourceLabel.value} path` : tool.value?.slug.validation_label || `${normalizedResourceLabel.value} path`
)
const effectiveSlugPlaceholder = computed(() =>
  props.slugPlaceholder || tool.value?.slug.placeholder || `my-${sentenceResourceLabel.value.replace(/\s+/g, '-')}`
)
const effectiveSuccessTitle = computed(() =>
  hasResourceOverride.value ? `Your ${sentenceResourceLabel.value} QR is ready` : tool.value?.ui.success_title || `Your ${sentenceResourceLabel.value} QR is ready`
)
const effectiveOpenTargetLabel = computed(() =>
  hasResourceOverride.value ? `Open ${sentenceResourceLabel.value}` : tool.value?.ui.open_target_label || `Open ${sentenceResourceLabel.value}`
)
const debugPayload = computed(() => ({
  configurable: {
    providerBaseUrl: props.providerBaseUrl || null,
    resourceLabel: props.resourceLabel || null,
    title: props.title || null,
    description: props.description || null,
    slugPlaceholder: props.slugPlaceholder || null,
  },
  providerResolution: tool.value
    ? {
        providerId: tool.value.provider.id,
        providerBaseUrl: tool.value.provider.base_url,
        providerTool: tool.value.tool.id,
        providerUploadType: tool.value.tool.upload_type,
        providerOwnsUploadType: true,
        createEndpoint: client.resolveUrl(tool.value.endpoints.create),
        availabilityEndpoint: client.resolveUrl(tool.value.endpoints.availability),
        configEndpoint: client.resolveUrl('/api/tools/public-doc/config'),
        appInfoEndpoint: client.resolveUrl(tool.value.endpoints.app_info),
      }
    : null,
  derivedLabels: tool.value
    ? {
        previewBaseUrl: tool.value.preview.base_url,
        previewPathSuffix: tool.value.preview.path_suffix,
        title: effectiveTitle.value,
        description: effectiveDescription.value,
        uploadLabel: effectiveUploadLabel.value,
        ctaLabel: effectiveCtaLabel.value,
        slugLabel: effectiveSlugLabel.value,
        slugPlaceholder: effectiveSlugPlaceholder.value,
      }
    : null,
  state: {
    pending: pending.value,
    error: error.value?.message || null,
  },
}))
</script>
