<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-10 sm:py-14">
      <div class="mx-auto max-w-5xl space-y-8">
        <header class="max-w-3xl space-y-3">
          <UBadge color="primary" variant="soft">Assets</UBadge>
          <h1 class="text-3xl font-semibold tracking-normal text-highlighted">
            {{ appName }} assets
          </h1>
          <p class="text-sm leading-6 text-muted">
            Canonical public asset paths for this app.
          </p>
        </header>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="asset in assetItems"
            :key="asset.key"
            variant="subtle"
            :ui="{ body: 'space-y-4' }"
          >
            <div
              class="asset-frame"
              :class="asset.wide ? 'asset-frame--wide' : 'asset-frame--square'"
            >
              <img
                :src="asset.src"
                :alt="asset.label"
                class="asset-image"
              >
            </div>

            <div class="space-y-1">
              <h2 class="text-sm font-semibold text-highlighted">
                {{ asset.label }}
              </h2>
              <code class="block break-all text-xs text-muted">
                {{ asset.src }}
              </code>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#imports'
import { useFireUXConfig } from '../composables/fireux/app/FireUXConfig'
import { useAssets } from '../composables/fireux/app/useAssets'

const fireux = useFireUXConfig()
const brandAssets = useAssets()

const appName = computed(() =>
  String(fireux.appName || fireux.appShortName || fireux.appId || 'App')
)

const assetItems = computed(() => [
  {
    key: 'logo',
    label: 'Logo',
    src: brandAssets.logo,
  },
  {
    key: 'wordmark-light',
    label: 'Wordmark light',
    src: brandAssets.wordmarkLight,
    wide: true,
  },
  {
    key: 'wordmark-dark',
    label: 'Wordmark dark',
    src: brandAssets.wordmarkDark,
    wide: true,
  },
  {
    key: 'thumbnail',
    label: 'Thumbnail',
    src: brandAssets.thumbnail,
    wide: true,
  },
  {
    key: 'cover',
    label: 'Cover',
    src: brandAssets.cover,
    wide: true,
  },
  {
    key: 'pwa-icon-192',
    label: 'PWA icon 192',
    src: brandAssets.pwaIcon192,
  },
  {
    key: 'pwa-icon-512',
    label: 'PWA icon 512',
    src: brandAssets.pwaIcon512,
  },
])

definePageMeta({
  nav: {
    key: 'assets',
    label: 'Assets',
    icon: 'i-lucide-image',
    order: 30,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})

useSeoMeta({
  title: () => `Assets - ${appName.value}`,
  description: () => `Public asset paths for ${appName.value}.`,
  robots: 'noindex,follow',
})
</script>

<style scoped>
.asset-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background:
    linear-gradient(45deg, color-mix(in oklab, var(--ui-bg-muted) 60%, transparent) 25%, transparent 25%),
    linear-gradient(-45deg, color-mix(in oklab, var(--ui-bg-muted) 60%, transparent) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, color-mix(in oklab, var(--ui-bg-muted) 60%, transparent) 75%),
    linear-gradient(-45deg, transparent 75%, color-mix(in oklab, var(--ui-bg-muted) 60%, transparent) 75%);
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  background-size: 16px 16px;
  padding: calc(var(--spacing) * 4);
}

.asset-frame--square {
  aspect-ratio: 1;
}

.asset-frame--wide {
  aspect-ratio: 16 / 9;
}

.asset-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
