<template>
  <UPage>
    <UPageHeader
      title="Dev · Images"
      description="These image URLs ship with fireux-core and are available to every app by default."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-base font-semibold">fireux-core public assets</h2>
        </template>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          fireux-core only ships shared identity and UX assets. Update this
          registry whenever files are added to
          <code>packages/core/fireux-core/src/runtime/public</code>.
        </p>

        <ul class="space-y-4">
          <li
            v-for="asset in coreAssets"
            :key="asset.path"
            class="dev-image-row"
          >
            <div :class="['dev-image-chip', previewToneClass(asset.tone)]">
              <img :src="asset.path" :alt="asset.label" />
            </div>

            <div class="space-y-1 text-sm">
              <code class="block">{{ asset.path }}</code>
              <p class="text-gray-500 dark:text-gray-400">{{ asset.label }}</p>
            </div>
          </li>
        </ul>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
type PreviewTone = 'light' | 'dark' | 'checker'

interface CoreAsset {
  path: string
  label: string
  tone?: PreviewTone
}

// Provide stable metadata for each preview tile.
const coreAssets: CoreAsset[] = [
  {
    path: '/img/default-image.png',
    label: 'Fallback image placeholder',
    tone: 'checker',
  },
  {
    path: '/img/auth/sign-in-dark.svg',
    label: 'Auth illustration · sign-in dark',
  },
  {
    path: '/img/auth/sign-in-light.svg',
    label: 'Auth illustration · sign-in light',
    tone: 'dark',
  },
  {
    path: '/img/auth/sign-up-dark.svg',
    label: 'Auth illustration · sign-up dark',
  },
  {
    path: '/img/auth/sign-up-light.svg',
    label: 'Auth illustration · sign-up light',
    tone: 'dark',
  },
  { path: '/img/brand/fireux/logo.png', label: 'FireUX logo mark' },
  {
    path: '/img/brand/fireux/wordmark-dark.png',
    label: 'FireUX wordmark · dark',
  },
  {
    path: '/img/brand/fireux/wordmark-light.png',
    label: 'FireUX wordmark · light',
    tone: 'dark',
  },
  {
    path: '/img/brand/fireux/wordmark-light.svg',
    label: 'FireUX wordmark · light (SVG)',
    tone: 'dark',
  },
]

const previewToneClass = (tone: PreviewTone = 'light') => {
  if (tone === 'dark') return 'dev-image-panel--dark'
  if (tone === 'checker') return 'dev-image-panel--checker'
  return 'dev-image-panel--light'
}

definePageMeta({
  layout: 'dev',
  alias: ['/dev/img'],
  nav: {
    key: 'dev-images',
    label: 'Images',
    icon: 'i-lucide-image',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 45,
  },
  title: 'Dev · Images',
  description: 'Inspect platform assets inherited from fireux-core.',
})
</script>

<style scoped>
.dev-image-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dev-image-chip {
  width: 80px;
  height: 80px;
  border-radius: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 0.75rem;
}

.dev-image-chip img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.dev-image-chip.dev-image-panel--dark img {
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.65));
}

.dev-image-chip.dev-image-panel--light {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.dev-image-chip.dev-image-panel--dark {
  background: #0f172a;
}

.dev-image-chip.dev-image-panel--checker {
  background-image: linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
    linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
    linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
}
</style>
