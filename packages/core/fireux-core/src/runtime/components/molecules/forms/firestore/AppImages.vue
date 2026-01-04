<template>
  <ClientOnly>
    <UCard class="fx-section">
      <template #header>
        <div class="fx-section__header">
          <div class="fx-section__copy">
            <h3 class="text-base font-semibold">Images</h3>
            <p class="text-xs text-dimmed">
              These are local public assets served from <span class="font-mono">/public/img/app</span>.
              Syncing (where available) overwrites the Firestore image URLs.
            </p>
          </div>
        </div>
      </template>

      <div class="fx-section__item space-y-5">
        <div class="space-y-3">
          <div class="text-xs font-medium text-dimmed">Synced images</div>

          <div
            v-for="item in syncedItems"
            :key="item.key"
            class="space-y-2"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex min-w-0 items-baseline gap-2">
                  <div class="shrink-0 text-sm font-medium">{{ item.label }}:</div>
                  <a
                    :href="item.path"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="min-w-0 text-xs text-dimmed underline break-all"
                  >
                    {{ item.path }}
                  </a>
                </div>
              </div>

              <UButton
                icon="i-lucide-refresh-cw"
                label="Sync"
                variant="soft"
                size="xs"
                :loading="saving === item.syncKind"
                :disabled="Boolean(saving)"
                :title="`Sync local ${item.syncKind} (overwrites Firestore URL)`"
                @click="onOverwrite(item.syncKind)"
              />
            </div>

            <div class="inline-flex max-w-full items-center">
              <img
                :src="item.path"
                :alt="`Local ${item.label}`"
                class="block max-w-[12rem]"
                :class="item.previewClass"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="text-xs text-dimmed" v-html="item.requirements" />
          </div>
        </div>

        <div class="space-y-3">
          <div class="text-xs font-medium text-dimmed">Required files</div>

          <div
            v-for="item in requiredOnlyItems"
            :key="item.key"
            class="space-y-2"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex min-w-0 items-baseline gap-2">
                  <div class="shrink-0 text-sm font-medium">{{ item.label }}:</div>
                  <a
                    :href="item.path"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="min-w-0 text-xs text-dimmed underline break-all"
                  >
                    {{ item.path }}
                  </a>
                </div>
              </div>
              <div class="text-xs text-dimmed">Not synced</div>
            </div>

            <div class="inline-flex max-w-full items-center">
              <img
                :src="item.path"
                :alt="`Local ${item.label}`"
                class="block max-w-[12rem]"
                :class="item.previewClass"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="text-xs text-dimmed" v-html="item.requirements" />
          </div>
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { App } from '../../../../models/core/app.model'
import { useAppUpdate } from '../../../../composables/fireux/firestore/core/app/mutations/useAppUpdate'
import { useToastify } from '../../../../composables/fireux/app/ui/useToastify'

const props = withDefaults(defineProps<{ app?: App | null }>(), { app: null })
const appRef = computed(() => props.app)

const toast = import.meta.client ? useToastify() : null
const { overwriteImageFromLocal } = import.meta.client
  ? useAppUpdate(appRef)
  : { overwriteImageFromLocal: async () => '' }

// Local public assets (served from each app's /public/img/app)
const localThumbnailPath = '/img/app/thumbnail.png'
const localCoverPath = '/img/app/cover.png'
const localFaviconPath = '/img/app/favicon.ico'
const localLogoPath = '/img/app/logo.png'
const localPwa192Path = '/img/app/pwa/icon-192.png'
const localPwa512Path = '/img/app/pwa/icon-512.png'
const localWordmarkLightPath = '/img/app/wordmark-light.png'
const localWordmarkDarkPath = '/img/app/wordmark-dark.png'

type ImageItemBase = {
  key: string
  label: string
  path: string
  requirements: string
  previewClass: string
}

type SyncedImageItem = ImageItemBase & { syncKind: SyncedImageKind }

const syncedItems: SyncedImageItem[] = [
  {
    key: 'logo',
    label: 'Logo',
    path: localLogoPath,
    requirements:
      'Required. Must be exactly <span class="font-mono">512×512</span> (validated by <span class="font-mono">/api/app/env-check</span>).',
    previewClass: 'h-10 w-auto object-contain',
    syncKind: 'logo',
  },
  {
    key: 'wordmark-light',
    label: 'Wordmark (light)',
    path: localWordmarkLightPath,
    requirements:
      'Required. Must be <span class="font-mono">≥256×64</span> and aspect <span class="font-mono">≥3:1</span> (validated by <span class="font-mono">/api/app/env-check</span>).',
    previewClass: 'h-8 w-auto object-contain',
    syncKind: 'wordmarkLight',
  },
  {
    key: 'wordmark-dark',
    label: 'Wordmark (dark)',
    path: localWordmarkDarkPath,
    requirements:
      'Required. Must be <span class="font-mono">≥256×64</span> and aspect <span class="font-mono">≥3:1</span> (validated by <span class="font-mono">/api/app/env-check</span>).',
    previewClass: 'h-8 w-auto object-contain',
    syncKind: 'wordmarkDark',
  },
  {
    key: 'avatar',
    label: 'Thumbnail',
    path: localThumbnailPath,
    requirements:
      'Required (<span class="font-mono">thumbnail.png</span>). No strict dimensions enforced today.',
    previewClass: 'h-12 w-12 rounded object-cover',
    syncKind: 'avatar',
  },
]

const requiredOnlyItems: ImageItemBase[] = [
  {
    key: 'cover',
    label: 'Cover',
    path: localCoverPath,
    requirements: 'Required. No strict dimensions enforced today.',
    previewClass: 'h-10 w-auto rounded object-cover',
  },
  {
    key: 'favicon',
    label: 'Favicon',
    path: localFaviconPath,
    requirements: 'Required. No strict dimensions enforced today.',
    previewClass: 'h-8 w-8 rounded object-contain',
  },
  {
    key: 'pwa-192',
    label: 'PWA icon (192)',
    path: localPwa192Path,
    requirements: 'Required. Must be exactly <span class="font-mono">192×192</span>.',
    previewClass: 'h-10 w-10 rounded object-contain',
  },
  {
    key: 'pwa-512',
    label: 'PWA icon (512)',
    path: localPwa512Path,
    requirements: 'Required. Must be exactly <span class="font-mono">512×512</span>.',
    previewClass: 'h-10 w-10 rounded object-contain',
  },
]

type SyncedImageKind = 'avatar' | 'logo' | 'wordmarkLight' | 'wordmarkDark'
const saving = ref<SyncedImageKind | null>(null)

const kindToLocalPath: Record<SyncedImageKind, string> = {
  avatar: localThumbnailPath,
  logo: localLogoPath,
  wordmarkLight: localWordmarkLightPath,
  wordmarkDark: localWordmarkDarkPath,
}

async function onOverwrite(kind: SyncedImageKind) {
  saving.value = kind
  try {
    await overwriteImageFromLocal(kind, kindToLocalPath[kind])
    toast?.success(`Updated ${kind} from local asset`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast?.error(`Failed to update ${kind}: ${message}`)
    throw error
  } finally {
    saving.value = null
  }
}
</script>
