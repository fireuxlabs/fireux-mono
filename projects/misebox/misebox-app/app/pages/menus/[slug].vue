<template>
  <main class="grid min-h-screen grid-rows-[auto_1fr] bg-white text-default">
    <header class="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div class="mx-auto max-w-5xl">
        <div class="flex items-center justify-center gap-2 text-center text-sm leading-6 text-amber-950">
          <UIcon name="i-lucide-wheat-off" class="size-4 shrink-0" />
          <p>
            If you have a food allergy or intolerance, please speak to a member of the team before ordering.
          </p>
          <UIcon name="i-lucide-wheat-off" class="size-4 shrink-0" />
        </div>
      </div>
    </header>

    <section class="min-h-0 overflow-auto bg-white" aria-label="Menu document">
      <ClientOnly v-if="isPdf">
        <MenuPdfViewer
          :url="fileUrl"
          :title="menu.name"
        />
      </ClientOnly>
      <iframe
        v-else
        :src="displayUrl"
        :title="menu.name"
        class="h-[calc(100vh-4.75rem)] w-full border-0"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { createError } from '#imports'

type PublicMenu = {
  id: string
  name: string
  doc_url: string
  doc_type: string
}

const route = useRoute()
const slug = String(route.params.slug || '').trim()

definePageMeta({
  layout: 'kitchen-menu',
  index: false,
  sitemap: false,
})

const { data } = await useAsyncData(
  `misebox-menu-${slug}`,
  () => $fetch<PublicMenu>(`/api/menus/${encodeURIComponent(slug)}`)
)

if (!data.value?.doc_url) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu not found.',
  })
}

const menu = computed(() => data.value as PublicMenu)
const isPdf = computed(() => menu.value.doc_type.includes('pdf'))
const fileUrl = computed(() => `/api/menus/${encodeURIComponent(slug)}/file`)
const displayUrl = computed(() => {
  return menu.value.doc_url
})

useSeoMeta({
  title: computed(() => `${menu.value.name} menu`),
  description: computed(() => `${menu.value.name} menu`),
})
</script>
