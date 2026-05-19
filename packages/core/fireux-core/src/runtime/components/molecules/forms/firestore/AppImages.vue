<template>
  <ClientOnly>
    <UCard class="section">
      <template #header>
        <div class="section__header">
          <div class="section__copy">
            <h3 class="text-base font-semibold">Images</h3>
            <p class="text-xs text-dimmed">
              Firestore + Storage URLs are canonical. Local public assets are the files served from
              <span class="font-mono">/public/img/app</span>.
            </p>
            <p
              v-if="isDev"
              class="text-xs text-dimmed"
            >
              In dev, local assets can be used as a display backup. Use Sync to Storage when the local file should become the app record media.
            </p>
          </div>
        </div>
      </template>

      <div class="section__item space-y-3">
        <div class="rounded-md border border-default bg-muted/30 px-3 py-2 text-xs text-dimmed">
          <span class="font-medium text-default">Local assets</span>
          live in <span class="font-mono">/public/img/app</span>.
          Syncable assets copy to <span class="font-mono">apps/{appId}/media/*</span>
          and update the app record.
        </div>

        <div class="overflow-hidden rounded-md border border-default">
          <div class="flex items-center justify-between gap-3 border-b border-default bg-muted/30 px-3 py-2">
            <div>
              <div class="text-xs font-medium text-default">Syncable media</div>
              <div class="text-[11px] text-dimmed">Compact previews only; dimensions are enforced by checks.</div>
            </div>
            <UBadge color="primary" variant="soft" size="sm">Storage</UBadge>
          </div>

          <div class="divide-y divide-default">
            <div
              v-for="item in syncableItems"
              :key="item.key"
              class="grid gap-2 px-3 py-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div class="flex min-w-0 flex-wrap items-center gap-2.5 sm:flex-nowrap">
                <div class="flex shrink-0 items-center gap-1.5">
                  <div
                    class="asset-preview-frame"
                    :class="`asset-preview-frame--${item.shape}`"
                    title="Storage preview"
                  >
                    <img
                      v-if="item.url"
                      :src="item.url"
                      :alt="`Storage ${item.label}`"
                      class="asset-preview-image"
                      :class="`asset-preview-image--${item.shape}`"
                      loading="lazy"
                      decoding="async"
                    />
                    <span v-else class="text-[9px] text-dimmed">-</span>
                  </div>
                  <div
                    class="asset-preview-frame"
                    :class="`asset-preview-frame--${item.shape}`"
                    title="Local preview"
                  >
                    <img
                      :src="item.path"
                      :alt="`Local ${item.label}`"
                      class="asset-preview-image"
                      :class="`asset-preview-image--${item.shape}`"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <div class="text-sm font-medium">{{ item.label }}</div>
                    <UBadge
                      :color="item.url ? 'success' : 'neutral'"
                      variant="soft"
                      size="sm"
                    >
                      {{ item.url ? 'Synced' : 'Missing' }}
                    </UBadge>
                  </div>
                  <div class="text-[11px] text-dimmed" v-html="item.requirements" />
                  <div class="hidden truncate text-[10px] text-dimmed md:block">
                    <span class="font-mono">{{ item.field }}</span>
                    <span class="px-1">-></span>
                    <span class="font-mono">{{ item.storagePath || 'storage unavailable' }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1.5 sm:justify-end">
                <a
                  :href="item.path"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-7 items-center rounded-md px-2 text-xs text-dimmed hover:bg-muted/50 hover:text-default"
                >
                  Local
                </a>
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-7 items-center rounded-md px-2 text-xs text-dimmed hover:bg-muted/50 hover:text-default"
                  :aria-label="`Open ${item.label} Storage URL`"
                >
                  Storage
                </a>
                <UButton
                  icon="i-lucide-refresh-cw"
                  label="Sync"
                  variant="soft"
                  size="xs"
                  :loading="saving === item.syncKind"
                  :disabled="Boolean(saving)"
                  :title="`Sync local ${kindLabel[item.syncKind]} to Firebase Storage and Firestore`"
                  @click="onOverwrite(item.syncKind)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-md border border-default">
          <div class="flex items-center justify-between gap-3 border-b border-default bg-muted/30 px-3 py-2">
            <div>
              <div class="text-xs font-medium text-default">Local-only files</div>
              <div class="text-[11px] text-dimmed">Required browser/install assets.</div>
            </div>
            <UBadge color="neutral" variant="soft" size="sm">Local</UBadge>
          </div>

          <div class="divide-y divide-default">
            <div
              v-for="item in requiredOnlyItems"
              :key="item.key"
              class="flex items-center justify-between gap-3 px-3 py-2"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <div
                  class="asset-preview-frame asset-preview-frame--square"
                >
                  <img
                    :src="item.path"
                    :alt="`Local ${item.label}`"
                    class="asset-preview-image asset-preview-image--square"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div class="min-w-0">
                  <div class="text-sm font-medium">{{ item.label }}</div>
                  <div class="text-[11px] text-dimmed" v-html="item.requirements" />
                </div>
              </div>

              <a
                :href="item.path"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-7 shrink-0 items-center rounded-md px-2 text-xs text-dimmed hover:bg-muted/50 hover:text-default"
              >
                Local
              </a>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from '../../../../composables/fireux/app/ui/useToastify'
import { useAppUpdate } from '../../../../composables/fireux/firestore/core/app/mutations/useAppUpdate'
import {
  appImageFirestoreField,
  appImageLocalPublicPath,
  appImageRequirement,
  appImageStoragePath,
  appPublicAssetRequirement,
  type AppImageKind,
} from '../../../../composables/fireux/firestore/core/app/utils/appMedia'
import type { AppModel } from '../../../../models/core/app.model'

const props = withDefaults(defineProps<{ app?: AppModel | null }>(), { app: null })
const appRef = computed(() => props.app)

const toast = import.meta.client ? useToastify() : null
const { overwriteImageFromLocal } = import.meta.client
  ? useAppUpdate(appRef)
  : { overwriteImageFromLocal: async () => '' }

const envCheckLabel =
  ' <span class="text-dimmed">(validated by <span class="font-mono">/api/internal/app/env-check</span>)</span>.'
const isDev = import.meta.dev

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
  `${appImageRequirement(kind).requirementsHtml}${envCheckLabel}`

type SyncedImageItem = ImageItemBase & {
  syncKind: SyncedImageKind
}

type ResolvedSyncedImageItem = SyncedImageItem & {
  field: string
  storagePath: string
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

const saving = ref<SyncedImageKind | null>(null)

const kindToLocalPath: Record<SyncedImageKind, string> = {
  thumbnail: appImageLocalPublicPath('thumbnail'),
  logo: appImageLocalPublicPath('logo'),
  wordmarkLight: appImageLocalPublicPath('wordmarkLight'),
  wordmarkDark: appImageLocalPublicPath('wordmarkDark'),
  cover: appImageLocalPublicPath('cover'),
}

const kindLabel: Record<SyncedImageKind, string> = {
  thumbnail: 'thumbnail',
  logo: 'logo',
  wordmarkLight: 'wordmark (light)',
  wordmarkDark: 'wordmark (dark)',
  cover: 'cover',
}

function mediaUrlForKind(value: AppModel | null | undefined, kind: AppImageKind) {
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
  const appId = value?.id || ''

  return syncedItems.map((item) => ({
    ...item,
    field: appImageFirestoreField(item.syncKind),
    storagePath: appId ? appImageStoragePath(appId, item.syncKind) : '',
    url: mediaUrlForKind(value, item.syncKind),
  }))
})

async function onOverwrite(kind: SyncedImageKind) {
  saving.value = kind
  try {
    await overwriteImageFromLocal(kind, kindToLocalPath[kind])
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
  border-radius: var(--ui-radius-sm, 0.25rem);
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
