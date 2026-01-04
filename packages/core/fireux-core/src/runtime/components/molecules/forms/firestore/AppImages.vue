<template>
  <ClientOnly>
    <UCard class="fx-section">
      <template #header>
        <div class="fx-section__header">
          <div class="fx-section__copy">
            <h3 class="text-base font-semibold">Images</h3>
            <p class="text-xs text-dimmed">
              These are local public assets served from <span class="font-mono">/public/img/app</span>.
              Syncing will overwrite the Firestore image URLs.
            </p>
          </div>
        </div>
      </template>

      <div class="fx-section__item space-y-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-2">
            <div class="text-sm font-medium">Logo</div>
            <a
              :href="localLogoPath"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-dimmed underline break-all"
            >
              {{ localLogoPath }}
            </a>

            <div class="inline-flex max-w-full items-center">
              <img
                :src="localLogoPath"
                alt="Local logo"
                class="block h-10 w-auto max-w-[12rem] object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <UButton
            icon="i-lucide-refresh-cw"
            label="Sync"
            variant="soft"
            size="xs"
            :loading="saving === 'logo'"
            :disabled="Boolean(saving)"
            title="Sync local logo (overwrites Firestore URL)"
            @click="onOverwrite('logo')"
          />
        </div>

        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-2">
            <div class="text-sm font-medium">Wordmark</div>
            <a
              :href="localWordmarkPath"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-dimmed underline break-all"
            >
              {{ localWordmarkPath }}
            </a>

            <div class="inline-flex max-w-full items-center">
              <img
                :src="localWordmarkPath"
                alt="Local wordmark"
                class="block h-8 w-auto max-w-[12rem] object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <UButton
            icon="i-lucide-refresh-cw"
            label="Sync"
            variant="soft"
            size="xs"
            :loading="saving === 'wordmark'"
            :disabled="Boolean(saving)"
            title="Sync local wordmark (overwrites Firestore URL)"
            @click="onOverwrite('wordmark')"
          />
        </div>

        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-2">
            <div class="text-sm font-medium">Avatar</div>
            <a
              :href="localAvatarPath"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-dimmed underline break-all"
            >
              {{ localAvatarPath }}
            </a>

            <div class="inline-flex max-w-full items-center">
              <img
                :src="localAvatarPath"
                alt="Local avatar"
                class="block h-12 w-12 rounded object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <UButton
            icon="i-lucide-refresh-cw"
            label="Sync"
            variant="soft"
            size="xs"
            :loading="saving === 'avatar'"
            :disabled="Boolean(saving)"
            title="Sync local avatar (overwrites Firestore URL)"
            @click="onOverwrite('avatar')"
          />
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
const localAvatarPath = '/img/app/thumbnail.png'
const localLogoPath = '/img/app/logo.png'
const localWordmarkPath = '/img/app/wordmark.png'

type AppImageKind = 'avatar' | 'logo' | 'wordmark'
const saving = ref<AppImageKind | null>(null)

const kindToLocalPath: Record<AppImageKind, string> = {
  avatar: localAvatarPath,
  logo: localLogoPath,
  wordmark: localWordmarkPath,
}

async function onOverwrite(kind: AppImageKind) {
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
