<template>
  <div class="menu-document">
    <div
      v-if="isPhoto"
      class="menu-document__photo"
    >
      <img
        :src="displayUrl"
        :alt="menuTitle"
        class="menu-document__image"
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
      class="menu-document__frame"
    />
  </div>
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
  sourceUrl?: string
  fileUrl?: string
}>()

const text = (value: unknown) => String(value ?? '').trim()
const menuTitle = computed(() => text(props.menu.name) || 'Menu')
const displayUrl = computed(() => text(props.sourceUrl) || text(props.menu.doc_url))
const fileUrl = computed(
  () => text(props.fileUrl) || `/api/menus/${encodeURIComponent(props.menuId)}/file`
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

<style scoped>
.menu-document {
  width: 100%;
}

.menu-document__photo {
  display: flex;
  justify-content: center;
}

.menu-document__image {
  width: auto;
  max-width: 100%;
  max-height: calc(100vh - 18rem);
  border-radius: 0.875rem;
  object-fit: contain;
  box-shadow: 0 1.25rem 3rem rgb(15 23 42 / 0.18);
}

.menu-document__frame {
  width: 100%;
  height: calc(100vh - 16rem);
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 1rem;
  background: var(--menu-bg);
}
</style>
