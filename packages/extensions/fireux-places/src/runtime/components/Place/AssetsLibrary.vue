<template>
  <section class="place-assets" aria-labelledby="place-assets-title">
    <header class="place-assets__header">
      <div>
        <p class="fx-type-label">Files</p>
        <h2 id="place-assets-title" class="fx-type-section-title">
          Asset library
        </h2>
        <p class="place-assets__intro">
          Place-owned files, their Storage targets, and the source sizes these
          surfaces are optimized for.
        </p>
      </div>
    </header>

    <div class="place-assets__grid">
      <article
        v-for="asset in assets"
        :key="asset.key"
        class="place-assets__card"
      >
        <div
          class="place-assets__preview"
          :class="[
            `place-assets__preview--${asset.aspectRatio}`,
            `place-assets__preview--${asset.key}`,
          ]"
        >
          <img
            v-if="asset.preview"
            :src="asset.preview"
            :alt="`${place.name} ${asset.label.toLowerCase()}`"
            loading="lazy"
            decoding="async"
          >
          <UIcon v-else name="i-lucide-image" aria-hidden="true" />
          <UBadge
            class="place-assets__status"
            :color="asset.statusColor"
            variant="solid"
            size="sm"
          >
            {{ asset.status }}
          </UBadge>
        </div>

        <div class="place-assets__body">
          <h3>{{ asset.label }}</h3>
          <div>
            <p class="place-assets__meta-label">Storage path</p>
            <code>{{ asset.path }}</code>
          </div>
          <div>
            <p class="place-assets__meta-label">Criteria</p>
            <p>{{ asset.requirements }}</p>
          </div>
          <div v-if="asset.preview">
            <p class="place-assets__meta-label">Current dimensions</p>
            <p>{{ asset.dimensionSummary }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  PLACE_ASSET_REQUIREMENTS,
  matchesPlaceAssetDimensions,
  placeAssetStoragePath,
} from '../../models/place-assets.model'
import type { PublicPlaceDetailProjection } from '../../models/place-public.model'

const props = defineProps<{
  place: PublicPlaceDetailProjection
}>()

type AssetMeasurement = {
  width: number
  height: number
  failed: boolean
}

const measurements = ref<Record<string, AssetMeasurement[]>>({})
let inspectionToken = 0

const currentUrls = computed<Record<string, string[]>>(() => ({
  image: props.place.assets.image ? [props.place.assets.image] : [],
  cover: props.place.assets.cover ? [props.place.assets.cover] : [],
  gallery: props.place.assets.gallery,
  logo: props.place.assets.logo ? [props.place.assets.logo] : [],
  wordmark: props.place.assets.wordmark ? [props.place.assets.wordmark] : [],
}))

function measureImage(url: string) {
  return new Promise<AssetMeasurement>((resolve) => {
    const image = new Image()
    image.onload = () => resolve({
      width: image.naturalWidth,
      height: image.naturalHeight,
      failed: false,
    })
    image.onerror = () => resolve({ width: 0, height: 0, failed: true })
    image.src = url
  })
}

async function inspectAssets() {
  if (!import.meta.client) return
  const token = ++inspectionToken
  const entries = await Promise.all(
    Object.entries(currentUrls.value).map(async ([key, urls]) => [
      key,
      await Promise.all(urls.map(measureImage)),
    ] as const)
  )
  if (token === inspectionToken) measurements.value = Object.fromEntries(entries)
}

watch(currentUrls, inspectAssets, { deep: true, immediate: true })

const assets = computed(() =>
  PLACE_ASSET_REQUIREMENTS.map((requirement) => {
    const urls = currentUrls.value[requirement.key] || []
    const results = measurements.value[requirement.key]
    const checking = Boolean(urls.length && !results)
    const matches = Boolean(
      results?.length &&
      results.length === urls.length &&
      results.every((result: AssetMeasurement) =>
        !result.failed &&
        matchesPlaceAssetDimensions(requirement, result.width, result.height)
      )
    )
    const dimensions = Array.from(new Set(
      (results || [])
        .filter((result: AssetMeasurement) => !result.failed)
        .map((result: AssetMeasurement) => `${result.width} × ${result.height} px`)
    ))
    return {
      ...requirement,
      path: placeAssetStoragePath(requirement, props.place.id),
      preview: urls[0] || '',
      status: !urls.length
        ? 'Missing'
        : checking
          ? 'Checking…'
          : matches
            ? 'Matches criteria'
            : 'Needs attention',
      statusColor: !urls.length || checking
        ? 'neutral' as const
        : matches
          ? 'success' as const
          : 'warning' as const,
      dimensionSummary: results?.some((result: AssetMeasurement) => result.failed)
        ? 'Could not read every image.'
        : requirement.multiple
          ? `${urls.length} image${urls.length === 1 ? '' : 's'} · ${dimensions.join(', ')}`
          : dimensions[0] || 'Checking dimensions…',
    }
  })
)
</script>

<style scoped>
.place-assets {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding-top: clamp(calc(var(--spacing) * 6), 5vw, calc(var(--spacing) * 10));
  border-top: 1px solid var(--ui-border);
}

.place-assets__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 5);
}

.place-assets__header > div {
  display: grid;
  max-width: 48rem;
  gap: calc(var(--spacing) * 2);
}

.place-assets__header .fx-type-label {
  color: var(--ui-primary);
}

.place-assets__intro,
.place-assets__body p {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.place-assets__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: calc(var(--spacing) * 4);
}

.place-assets__card {
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-elevated);
}

.place-assets__preview {
  position: relative;
  display: grid;
  aspect-ratio: 4 / 3;
  place-items: center;
  overflow: hidden;
  background: var(--ui-bg-accented);
  color: var(--ui-text-dimmed);
}

.place-assets__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-assets__preview--logo img,
.place-assets__preview--wordmark img {
  object-fit: contain;
}

.place-assets__preview--logo img,
.place-assets__preview--wordmark img {
  padding: calc(var(--spacing) * 6);
}

.place-assets__preview > svg {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
}

.place-assets__status {
  position: absolute;
  top: calc(var(--spacing) * 3);
  right: calc(var(--spacing) * 3);
}

.place-assets__body {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4);
}

.place-assets__body h3 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
}

.place-assets__meta-label {
  margin-bottom: calc(var(--spacing) * 1) !important;
  color: var(--ui-text-dimmed) !important;
  font-size: var(--text-xs) !important;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: .04em;
}

.place-assets__body code {
  display: block;
  overflow-wrap: anywhere;
  color: var(--ui-text-toned);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

@media (max-width: 39.99rem) {
  .place-assets__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
