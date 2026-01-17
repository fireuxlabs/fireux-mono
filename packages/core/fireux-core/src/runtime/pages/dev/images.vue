<template>
  <UPage>
    <UPageHeader
      title="Dev · Images"
      description="Lists all images found under public/img for the current runtime (app + core + active ecosystem)."
    />

    <UPageBody class="pagebody">
      <ClientOnly>
        <UCard>
          <template #header>
            <div class="space-y-1">
              <h2 class="text-base font-semibold">Firestore app images</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Shows canonical image URLs stored on <span class="font-mono">apps</span> docs.
              </p>
            </div>
          </template>

          <template v-if="firestorePending">
            <p class="text-sm text-gray-500 dark:text-gray-400">Loading Firestore apps…</p>
          </template>

          <template v-else-if="!firestoreAppGroups.length">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              No app images found (or you don’t have access to read the <span class="font-mono">apps</span> collection).
            </p>
          </template>

          <template v-else>
            <ul class="space-y-6">
              <li
                v-for="app in firestoreAppGroups"
                :key="app.id"
                class="space-y-3"
              >
                <div class="space-y-0.5">
                  <div class="text-sm font-semibold">{{ app.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    <span class="font-mono">{{ app.id }}</span>
                  </div>
                </div>

                <ul class="space-y-3">
                  <li
                    v-for="img in app.images"
                    :key="`${app.id}:${img.key}`"
                    class="dev-image-row"
                  >
                    <div class="dev-image-chip dev-image-panel--checker">
                      <img :src="img.url" :alt="img.key" />
                    </div>

                    <div class="space-y-1 text-sm">
                      <div class="text-xs font-medium">{{ img.label }}</div>
                      <code class="block break-all">{{ img.url }}</code>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </template>
        </UCard>
      </ClientOnly>

      <UCard v-for="group in groups" :key="group.key">
        <template #header>
          <div class="space-y-1">
            <h2 class="text-base font-semibold">{{ group.title }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <span class="font-mono">{{ group.rootDir }}</span>
            </p>
          </div>
        </template>

        <template v-if="group.images.length">
          <ul class="space-y-4">
            <li
              v-for="img in group.images"
              :key="img.urlPath"
              class="dev-image-row"
            >
              <div class="dev-image-chip dev-image-panel--checker">
                <img :src="img.urlPath" :alt="img.urlPath" />
              </div>

              <div class="space-y-1 text-sm">
                <code class="block">{{ img.urlPath }}</code>
                <code class="block text-xs text-gray-500 dark:text-gray-400">{{ img.filePath }}</code>
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            No images found under <span class="font-mono">{{ group.rootDir }}/img</span>.
          </p>
        </template>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import type { App } from '../../models/core/app.model'

type ImageEntry = {
  urlPath: string
  filePath: string
}

type ImageGroup = {
  key: string
  title: string
  rootDir: string
  images: ImageEntry[]
}

const { data } = await useFetch<{ groups: ImageGroup[] }>('/api/dev/images')
const groups = computed(() => data.value?.groups ?? [])

type FirestoreAppImage = { key: string; label: string; url: string }
type FirestoreAppGroup = { id: string; name: string; images: FirestoreAppImage[] }

const appsRef = import.meta.client
  ? useFirestoreRead().firestoreFetchCollection<App>('apps')
  : (null as any)

const firestorePending = computed(() => import.meta.client && appsRef?.value === undefined)

function collectFirestoreImages(app: App & Record<string, any>): FirestoreAppImage[] {
  const entries: FirestoreAppImage[] = []

  const push = (key: string, label: string, value: unknown) => {
    if (typeof value !== 'string') return
    const url = value.trim()
    if (!url) return
    entries.push({ key, label, url })
  }

  // Canonical fields used across the app
  push('avatar_url', 'Thumbnail (avatar_url)', (app as any).avatar_url)
  push('logo_url', 'Logo (logo_url)', (app as any).logo_url)
  push('wordmark_light_url', 'Wordmark (light)', (app as any).wordmark_light_url)
  push('wordmark_dark_url', 'Wordmark (dark)', (app as any).wordmark_dark_url)

  // De-dupe by url, keep first label
  const seen = new Set<string>()
  return entries.filter((e) => {
    if (seen.has(e.url)) return false
    seen.add(e.url)
    return true
  })
}

const firestoreAppGroups = computed<FirestoreAppGroup[]>(() => {
  if (!import.meta.client) return []
  const apps = (appsRef?.value ?? []) as Array<App & Record<string, any>>
  return apps
    .map((app) => {
      const images = collectFirestoreImages(app)
      return {
        id: (app.id ?? '').toString(),
        name: (app.app_name ?? app.id ?? 'App').toString().trim() || 'App',
        images,
      }
    })
    .filter((app) => Boolean(app.id) && app.images.length)
    .sort((a, b) => a.name.localeCompare(b.name))
})

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-images',
    label: 'Images',
    icon: 'i-lucide-image',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 40,
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
