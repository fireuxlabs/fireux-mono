<template>
  <ClientOnly>
    <UCard>
      <div class="space-y-6">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <a
              :href="localLogoPath"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-gray-500 underline break-all"
            >
              <span class="font-medium text-gray-700">Logo:</span>
              {{ localLogoPath }}
            </a>

            <div class="mt-2">
              <img
                :src="localLogoPath"
                alt="Local logo"
                class="block h-14 w-auto"
              />
            </div>
          </div>

          <UButton
            icon="i-lucide-refresh-cw"
            variant="soft"
            size="xs"
            :loading="saving === 'logo'"
            :disabled="Boolean(saving)"
            title="Sync local logo"
            @click="onOverwrite('logo')"
          />
        </div>

        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <a
              :href="localWordmarkPath"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-gray-500 underline break-all"
            >
              <span class="font-medium text-gray-700">Wordmark:</span>
              {{ localWordmarkPath }}
            </a>

            <div class="mt-2">
              <img
                :src="localWordmarkPath"
                alt="Local wordmark"
                class="block h-8 w-auto"
              />
            </div>
          </div>

          <UButton
            icon="i-lucide-refresh-cw"
            variant="soft"
            size="xs"
            :loading="saving === 'wordmark'"
            :disabled="Boolean(saving)"
            title="Sync local wordmark"
            @click="onOverwrite('wordmark')"
          />
        </div>

        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <a
              :href="localAvatarPath"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-gray-500 underline break-all"
            >
              <span class="font-medium text-gray-700">Thumbnail:</span>
              {{ localAvatarPath }}
            </a>

            <div class="mt-2">
              <img
                :src="localAvatarPath"
                alt="Local thumbnail"
                class="block h-12 w-12 rounded object-cover"
              />
            </div>
          </div>

          <UButton
            icon="i-lucide-refresh-cw"
            variant="soft"
            size="xs"
            :loading="saving === 'avatar'"
            :disabled="Boolean(saving)"
            title="Sync local thumbnail"
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
