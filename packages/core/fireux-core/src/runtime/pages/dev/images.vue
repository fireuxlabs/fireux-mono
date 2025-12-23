<template>
  <UPage>
    <UPageHeader
      title="Dev · Images"
      description="Lists all images found under public/img for the current runtime (app + core + active ecosystem)."
    />

    <UPageBody class="pagebody">
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
