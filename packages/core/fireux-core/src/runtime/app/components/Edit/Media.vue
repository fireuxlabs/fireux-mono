<!-- Concurrent edit — 2026-07-21 20:23 CEST — Developer Dashboard cleanup: reduce App media to one status-led source-to-Storage workflow. -->
<template>
  <ClientOnly>
    <UPageCard
      title="App media"
      description="Review repository assets and sync them to the canonical App record."
      icon="i-lucide-images"
      variant="subtle"
    >
      <div class="fx-card-body-stack">
        <div>
          <div>
            <p>Storage status</p>
            <p>
              {{ syncedCount }} of {{ syncableItems.length }} media assets are
              recorded on this App.
            </p>
          </div>
          <UBadge
            :color="allMediaSynced ? 'success' : 'warning'"
            variant="soft"
          >
            {{ allMediaSynced ? 'URLs recorded' : `${missingCount} missing` }}
          </UBadge>
        </div>

        <div>
          <div>
            <div v-for="item in syncableItems" :key="item.key">
              <div>
                <div
                  class="asset-preview-frame"
                  :class="`asset-preview-frame--${item.shape}`"
                  title="Repository asset preview"
                >
                  <img
                    :src="item.path"
                    :alt="`${item.label} repository asset`"
                    class="asset-preview-image"
                    :class="`asset-preview-image--${item.shape}`"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div>
                  <div>
                    <div>{{ item.label }}</div>
                    <UBadge
                      :color="item.url ? 'success' : 'neutral'"
                      variant="soft"
                      size="sm"
                    >
                      {{ item.url ? 'URL recorded' : 'Missing' }}
                    </UBadge>
                  </div>
                  <div v-html="item.requirements" />
                </div>
              </div>

              <div>
                <a :href="item.path" target="_blank" rel="noopener noreferrer">
                  Source
                </a>
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`Open ${item.label} Storage URL`"
                >
                  Stored
                </a>
                <UButton
                  icon="i-lucide-refresh-cw"
                  label="Sync"
                  variant="soft"
                  size="xs"
                  :loading="saving === item.syncKind"
                  :disabled="!canSync || Boolean(saving)"
                  :title="`Sync local ${kindLabel[item.syncKind]} to Firebase Storage and Firestore`"
                  @click="onSync(item.syncKind)"
                />
              </div>
            </div>
          </div>
        </div>

        <p v-if="!canSync">Sync App media from a development build.</p>

        <FireDisclosurePanel
          title="Install assets"
          :description="`${requiredOnlyItems.length} browser and PWA files stay in the repository.`"
          icon="i-lucide-monitor-down"
          :default-open="false"
        >
          <div>
            <div>
              <div v-for="item in requiredOnlyItems" :key="item.key">
                <div>
                  <div class="asset-preview-frame asset-preview-frame--square">
                    <img
                      :src="item.path"
                      :alt="`${item.label} repository asset`"
                      class="asset-preview-image asset-preview-image--square"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div>
                    <div>{{ item.label }}</div>
                    <div v-html="item.requirements" />
                  </div>
                </div>

                <a :href="item.path" target="_blank" rel="noopener noreferrer">
                  Source
                </a>
              </div>
            </div>
          </div>
        </FireDisclosurePanel>

        <p>
          Source files live in <span>/public/img/app</span>. Sync validates
          dimensions, writes to <span>apps/{appId}/img/app/*</span>, and updates
          the App record. A recorded URL does not verify that it matches the
          current source file.
        </p>
      </div>
    </UPageCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from '../../../composables/ui/useToastify'
import { syncAppMediaToStorage } from '../../composables/media/sync-app-media'
import {
  appImageLocalPublicPath,
  appImageRequirement,
  appPublicAssetRequirement,
} from '../../utils/app-media'
import { type AppImageKind } from '../../models/app-media'
import type { App } from '../../models/app.model.ts'

const props = withDefaults(defineProps<{ app?: App | null }>(), { app: null })
const appRef = computed(() => props.app)

const toast = import.meta.client ? useToastify() : null
type AssetPreviewShape = 'square' | 'wide' | 'wordmark'

type ImageItemBase = {
  key: string
  label: string
  path: string
  requirements: string
  shape: AssetPreviewShape
}

type SyncedImageKind = AppImageKind

const validatedRequirement = (kind: SyncedImageKind) =>
  appImageRequirement(kind).requirementsHtml

type SyncedImageItem = ImageItemBase & {
  syncKind: SyncedImageKind
}

type ResolvedSyncedImageItem = SyncedImageItem & {
  url: string
}

const syncedItems: SyncedImageItem[] = [
  {
    key: 'logo',
    label: 'Logo',
    path: appImageLocalPublicPath('logo'),
    requirements: validatedRequirement('logo'),
    shape: 'square',
    syncKind: 'logo',
  },
  {
    key: 'wordmark-light',
    label: 'Wordmark (light)',
    path: appImageLocalPublicPath('wordmarkLight'),
    requirements: validatedRequirement('wordmarkLight'),
    shape: 'wordmark',
    syncKind: 'wordmarkLight',
  },
  {
    key: 'wordmark-dark',
    label: 'Wordmark (dark)',
    path: appImageLocalPublicPath('wordmarkDark'),
    requirements: validatedRequirement('wordmarkDark'),
    shape: 'wordmark',
    syncKind: 'wordmarkDark',
  },
  {
    key: 'thumbnail',
    label: 'Thumbnail',
    path: appImageLocalPublicPath('thumbnail'),
    requirements: validatedRequirement('thumbnail'),
    shape: 'wide',
    syncKind: 'thumbnail',
  },
  {
    key: 'cover',
    label: 'Cover',
    path: appImageLocalPublicPath('cover'),
    requirements: validatedRequirement('cover'),
    shape: 'wide',
    syncKind: 'cover',
  },
]

const requiredOnlyItems: ImageItemBase[] = [
  {
    key: 'favicon',
    label: 'Favicon',
    path: appPublicAssetRequirement('favicon').localPublicPath,
    requirements: appPublicAssetRequirement('favicon').requirementsHtml,
    shape: 'square',
  },
  {
    key: 'pwa-192',
    label: 'PWA icon (192)',
    path: appPublicAssetRequirement('pwaIcon192').localPublicPath,
    requirements: appPublicAssetRequirement('pwaIcon192').requirementsHtml,
    shape: 'square',
  },
  {
    key: 'pwa-512',
    label: 'PWA icon (512)',
    path: appPublicAssetRequirement('pwaIcon512').localPublicPath,
    requirements: appPublicAssetRequirement('pwaIcon512').requirementsHtml,
    shape: 'square',
  },
]

const canSync = import.meta.dev
const saving = ref<SyncedImageKind | null>(null)

const kindLabel: Record<SyncedImageKind, string> = {
  thumbnail: 'thumbnail',
  logo: 'logo',
  wordmarkLight: 'wordmark (light)',
  wordmarkDark: 'wordmark (dark)',
  cover: 'cover',
}

function mediaUrlForKind(value: App | null | undefined, kind: AppImageKind) {
  switch (kind) {
    case 'thumbnail':
      return value?.media?.thumbnail_url || ''
    case 'logo':
      return value?.media?.logo_url || ''
    case 'wordmarkLight':
      return value?.media?.wordmark_light_url || ''
    case 'wordmarkDark':
      return value?.media?.wordmark_dark_url || ''
    case 'cover':
      return value?.media?.cover_url || ''
  }
}

const syncableItems = computed<ResolvedSyncedImageItem[]>(() => {
  const value = appRef.value

  return syncedItems.map((item) => ({
    ...item,
    url: mediaUrlForKind(value, item.syncKind),
  }))
})

const syncedCount = computed(
  () => syncableItems.value.filter((item) => Boolean(item.url)).length
)
const missingCount = computed(
  () => syncableItems.value.length - syncedCount.value
)
const allMediaSynced = computed(
  () => syncableItems.value.length > 0 && missingCount.value === 0
)

async function onSync(kind: SyncedImageKind) {
  if (!canSync || saving.value) return
  saving.value = kind
  try {
    const result = await syncAppMediaToStorage([kind])
    if (result.failed.length) {
      throw new Error(result.failed.map((failure) => failure.message).join(' '))
    }
    toast?.success(`Updated ${kindLabel[kind]} from local asset`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast?.error(`Failed to update ${kindLabel[kind]}: ${message}`)
    throw error
  } finally {
    saving.value = null
  }
}
</script>

<style scoped>
.asset-preview-frame {
  --asset-preview-image-max-height: 100%;
  --asset-preview-image-max-width: 100%;
  --asset-preview-image-fit: contain;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 3rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: color-mix(in oklab, var(--ui-bg-muted) 45%, transparent);
}

.asset-preview-frame--square {
  --asset-preview-image-max-height: 2.25rem;
  --asset-preview-image-max-width: 2.25rem;
  width: 3rem;
}

.asset-preview-frame--wide {
  --asset-preview-image-fit: cover;
  width: 5.25rem;
}

.asset-preview-frame--wordmark {
  --asset-preview-image-max-height: 1.875rem;
  --asset-preview-image-max-width: 7.25rem;
  width: 8rem;
}

.asset-preview-image {
  display: block;
  max-width: var(--asset-preview-image-max-width);
  max-height: var(--asset-preview-image-max-height);
  object-fit: var(--asset-preview-image-fit);
}

.asset-preview-image--square {
  width: auto;
  height: auto;
}

.asset-preview-image--wide {
  width: 100%;
  height: 100%;
}

.asset-preview-image--wordmark {
  width: auto;
  height: auto;
}

@media (min-width: 640px) {
  .asset-preview-frame--wordmark {
    --asset-preview-image-max-width: 8.25rem;
    width: 9rem;
  }
}
</style>
