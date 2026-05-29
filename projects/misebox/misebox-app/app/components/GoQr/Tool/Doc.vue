<template>
  <div class="space-y-4">
    <GoQrBrandAttribution
      v-if="poweredBy"
      :brand="poweredBy"
    />

    <form class="space-y-4" @submit.prevent="createQr">
      <p
        v-if="safetyCopy"
        class="rounded-md border border-default bg-muted/30 px-3 py-2 text-sm text-muted"
      >
        {{ safetyCopy }}
      </p>

      <p
        v-if="upsellCopy"
        class="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-highlighted"
      >
        {{ upsellCopy }}
      </p>

      <UFileUpload
        :model-value="file"
        :accept="toolAccept"
        :color="uploadError ? 'error' : 'primary'"
        :highlight="Boolean(uploadError)"
        :label="toolUploadLabel"
        :description="uploadDescription"
        size="xl"
        variant="area"
        class="w-full"
        :ui="{ base: minHeightClass }"
        @update:model-value="setFile"
      />

      <UFormField :label="toolSlugLabel">
        <UInput
          v-model="slugInput"
          :placeholder="toolSlugPlaceholder"
          class="w-full"
        />
        <p class="mt-1 text-xs text-muted">
          {{ previewUrl }}
        </p>
        <p
          v-if="slugError"
          class="mt-1 text-xs text-error"
        >
          {{ slugError }}
        </p>
        <p
          v-else-if="slugTaken"
          class="mt-1 text-xs text-error"
        >
          {{ toolTakenMessage }}
        </p>
      </UFormField>

      <UButton
        type="submit"
        icon="i-lucide-qr-code"
        block
        size="lg"
        :disabled="!canCreate"
        :loading="isCreating"
      >
        {{ isCreating ? toolLoadingLabel : toolCtaLabel }}
      </UButton>

      <p
        v-if="createError"
        class="text-xs text-error"
      >
        {{ createError }}
      </p>
    </form>

    <UCard
      v-if="!navigateOnSuccess && createdQrUrl"
      variant="subtle"
    >
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">
          {{ toolSuccessTitle }}
        </h2>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="createdTargetUrl"
          :to="createdTargetUrl"
          target="_blank"
          icon="i-lucide-external-link"
        >
          {{ toolOpenTargetLabel }}
        </UButton>
        <UButton
          :to="createdQrUrl"
          target="_blank"
          icon="i-lucide-qr-code"
          variant="soft"
        >
          {{ toolOpenQrLabel }}
        </UButton>
      </div>
    </UCard>

    <DevJson
      class="mt-4"
      :data="debugPayload"
      title="Go QR doc tool"
      context="Go QR doc tool contract, resolved preview paths, endpoints, and local state."
      :hide-when-empty="false"
    />
  </div>
</template>

<script setup lang="ts">
import {
  useGoQrToolDoc,
} from '../../../composables/goQr/useGoQrToolDoc'
import {
  goQrToolDocDefaults,
  type GoQrToolDocProps,
} from '../../../utils/goQrToolDoc'

const props = withDefaults(defineProps<GoQrToolDocProps>(), goQrToolDocDefaults())
const {
  file,
  slugInput,
  slugError,
  slugTaken,
  uploadError,
  uploadDescription,
  previewUrl,
  poweredBy,
  createdTargetUrl,
  createdQrUrl,
  createError,
  isCreating,
  canCreate,
  debugPayload,
  setFile,
  createQr,
  toolAccept,
  toolUploadLabel,
  toolCtaLabel,
  toolLoadingLabel,
  toolSlugLabel,
  toolSlugPlaceholder,
  toolTakenMessage,
  toolSuccessTitle,
  toolOpenTargetLabel,
  toolOpenQrLabel,
} = useGoQrToolDoc(props)
</script>
