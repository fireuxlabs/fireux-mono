<template>
  <UCard
    as="article"
    :description="asset.description"
    :ui="{ body: 'fx-card-body-stack', footer: 'fx-card-body-stack' }"
  >
    <template #title
      ><h3>{{ asset.label }}</h3></template
    >

    <div
      class="app-asset__preview"
      :class="[
        `app-asset__preview--${surface}`,
        `app-asset__preview--${asset.shape}`,
      ]"
    >
      <img
        v-if="!failed"
        :key="asset.src"
        ref="previewImage"
        :src="asset.src"
        :alt="asset.label"
        loading="lazy"
        decoding="async"
        @load="onLoad"
        @error="failed = true"
      />
      <UAlert
        v-else
        color="warning"
        variant="subtle"
        title="Image unavailable"
        description="This file could not be loaded."
      />
    </div>

    <div class="card__header">
      <p class="fx-type-caption" aria-live="polite">
        {{ failed ? 'Could not load' : dimensions || 'Loading preview…' }} ·
        {{ format }}
      </p>
      <UFieldGroup
        size="xs"
        role="group"
        :aria-label="`${asset.label} background`"
      >
        <UButton
          icon="i-lucide-sun"
          color="neutral"
          :variant="surface === 'light' ? 'solid' : 'outline'"
          :aria-pressed="surface === 'light'"
          :aria-label="`Preview ${asset.label} on light`"
          @click="surface = 'light'"
        />
        <UButton
          icon="i-lucide-moon"
          color="neutral"
          :variant="surface === 'dark' ? 'solid' : 'outline'"
          :aria-pressed="surface === 'dark'"
          :aria-label="`Preview ${asset.label} on dark`"
          @click="surface = 'dark'"
        />
      </UFieldGroup>
    </div>

    <template #footer>
      <UFieldGroup size="sm">
        <UButton
          :to="asset.src"
          external
          target="_blank"
          color="neutral"
          variant="outline"
          icon="i-lucide-external-link"
          :aria-label="`Open ${asset.label} original`"
          >Open</UButton
        >
        <UButton
          :to="asset.src"
          external
          :download="asset.src.split('/').pop()"
          color="neutral"
          variant="outline"
          icon="i-lucide-download"
          :aria-label="`Download ${asset.label}`"
          :disabled="failed"
          >Download</UButton
        >
      </UFieldGroup>
      <FireDisclosurePanel
        title="File details"
        variant="link"
        size="xs"
        :block="false"
      >
        <div class="fx-card-body-stack">
          <code class="app-asset__path fx-type-code">{{ asset.src }}</code>
          <p v-if="asset.requirements" class="fx-type-caption">
            {{ asset.requirements }}
          </p>
        </div>
      </FireDisclosurePanel>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type {
  AppAssetItem,
  AppAssetSurface,
} from '../../models/asset-catalogue'

const props = defineProps<{ asset: AppAssetItem }>()
const surface = ref<AppAssetSurface>(props.asset.surface || 'light')
const failed = ref(false)
const dimensions = ref('')
const previewImage = ref<HTMLImageElement | null>(null)
const format = computed(() => props.asset.src.split('.').pop()?.toUpperCase())

watch(
  () => props.asset.src,
  () => {
    failed.value = false
    dimensions.value = ''
    surface.value = props.asset.surface || 'light'
  }
)

function recordDimensions(image: HTMLImageElement) {
  dimensions.value = `${image.naturalWidth} × ${image.naturalHeight}`
}

function onLoad(event: Event) {
  recordDimensions(event.currentTarget as HTMLImageElement)
}

onMounted(() => {
  // An SSR image can finish loading before Vue attaches its load listener.
  const image = previewImage.value
  if (!image?.complete) return
  if (image.naturalWidth) recordDimensions(image)
  else failed.value = true
})
</script>

<style scoped>
/* Preview geometry and fixed surfaces preserve the whole image and its contrast. */
.app-asset__preview {
  display: grid;
  place-items: center;
  block-size: 12rem;
  overflow: hidden;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}
.app-asset__preview--light {
  background: var(--ui-color-neutral-50);
}
.app-asset__preview--dark {
  background: var(--ui-color-neutral-950);
}
.app-asset__preview img {
  inline-size: 100%;
  block-size: 100%;
  min-block-size: 0;
  object-fit: contain;
}
.app-asset__preview--square img {
  max-inline-size: 8rem;
  max-block-size: 8rem;
}
.app-asset__path {
  overflow-wrap: anywhere;
}
</style>
