<template>
  <UPageCard variant="subtle">
    <div
      v-if="isPhoto"
      class="flex min-h-[calc(100vh-16rem)] items-start justify-center rounded-2xl border border-default bg-[var(--ui-bg)] p-3 sm:p-5"
    >
      <img
        :src="displayUrl"
        :alt="menuTitle"
        class="h-auto max-h-[calc(100vh-18rem)] w-auto max-w-full rounded-xl object-contain shadow-lg"
      >
    </div>

    <ClientOnly v-else-if="isPdf">
      <MenuPdfViewer
        :url="fileUrl"
        :title="menuTitle"
      />
    </ClientOnly>

    <iframe
      v-else
      :src="displayUrl"
      :title="menuTitle"
      class="h-[calc(100vh-16rem)] w-full rounded-2xl border border-default bg-[var(--ui-bg)]"
    />
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type MenuDocumentSource = {
  id?: string
  name?: string
  doc_url?: string
  doc_type?: string
  kind?: string
}

const props = defineProps<{
  menu: MenuDocumentSource
  menuId: string
}>()

const text = (value: unknown) => String(value ?? '').trim()
const menuTitle = computed(() => text(props.menu.name) || 'Menu')
const displayUrl = computed(() => text(props.menu.doc_url))
const fileUrl = computed(
  () => `/api/menus/${encodeURIComponent(props.menuId)}/file`
)
const isPhoto = computed(() =>
  props.menu.kind === 'photo' ||
  text(props.menu.doc_type).startsWith('image/')
)
const isPdf = computed(() =>
  !isPhoto.value &&
  (props.menu.kind === 'pdf' || text(props.menu.doc_type).includes('pdf'))
)
</script>
