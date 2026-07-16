<template>
  <div
    class="menu-document"
    :data-menu-document-kind="documentKind"
  >
    <a
      v-if="displayUrl"
      :href="displayUrl"
      class="menu-document__open"
      target="_blank"
      rel="noopener noreferrer"
    >
      Open original
      <span aria-hidden="true">↗</span>
      <span class="sr-only">(opens in a new tab)</span>
    </a>

    <div
      v-if="isPhoto"
      class="menu-document__photo"
    >
      <img
        v-if="!previewFailed"
        :src="displayUrl"
        :alt="menuTitle"
        class="menu-document__image"
        decoding="async"
        @error="previewFailed = true"
      >

      <p v-else class="menu-document__preview-state" role="alert">
        Image preview unavailable. Use Open original instead.
      </p>
    </div>

    <ClientOnly v-else-if="isPdf">
      <MenuDetailDocumentPdfViewer
        :url="displayUrl"
        :title="menuTitle"
      />

      <template #fallback>
        <p class="menu-document__preview-state" role="status">
          Loading menu document…
        </p>
      </template>
    </ClientOnly>

    <div v-else class="menu-document__generic">
      <p class="menu-document__kind">Document menu</p>
      <p class="menu-document__file-name">{{ fileName }}</p>
      <p class="menu-document__preview-copy">
        This file cannot be previewed reliably in the browser.
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MenuDocumentPayload } from '../../../../models/kitchen/menu/menu-detail.model'

const props = defineProps<{
  menu: MenuDocumentPayload
  menuId: string
  documentUrl?: string
  fileUrl?: string
}>()

const text = (value: unknown) => String(value ?? '').trim()
const previewFailed = ref(false)
const menuTitle = computed(() => text(props.menu.name) || 'Menu')
const displayUrl = computed(
  () =>
    text(props.documentUrl) ||
    text(props.fileUrl) ||
    text(props.menu.file?.url) ||
    `/api/menus/${encodeURIComponent(props.menuId)}/file`
)
const fileName = computed(() => text(props.menu.file?.name) || menuTitle.value)
const isPhoto = computed(() =>
  props.menu.fileKind === 'photo' ||
  text(props.menu.file?.type).startsWith('image/')
)
const isPdf = computed(() =>
  !isPhoto.value &&
  (props.menu.fileKind === 'pdf' ||
    text(props.menu.file?.type).includes('pdf'))
)
const documentKind = computed(() =>
  isPhoto.value ? 'photo' : isPdf.value ? 'pdf' : 'document'
)

watch(displayUrl, () => {
  previewFailed.value = false
})
</script>

<style scoped>
.menu-document {
  display: grid;
  width: 100%;
  gap: 1rem;
}

.menu-document__photo {
  display: grid;
  min-height: 12rem;
  place-items: center;
}

.menu-document__image {
  width: auto;
  max-width: 100%;
  max-height: min(56rem, 72vh);
  max-height: min(56rem, 72dvh);
  border-radius: 0.875rem;
  object-fit: contain;
  box-shadow: 0 1.25rem 3rem rgb(15 23 42 / 0.18);
}

.menu-document__preview-state,
.menu-document__generic {
  display: grid;
  min-height: 12rem;
  place-content: center;
  justify-items: center;
  margin: 0;
  padding: 2rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: var(--menu-radius);
  color: var(--menu-muted);
  text-align: center;
}

.menu-document__generic p {
  margin: 0;
}

.menu-document__kind {
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.menu-document__file-name {
  max-width: 34rem;
  margin-top: 0.6rem !important;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(1.35rem, 4vw, 2rem);
  font-weight: 800;
  overflow-wrap: anywhere;
}

.menu-document__preview-copy {
  margin-top: 0.7rem !important;
  color: var(--menu-muted);
  line-height: 1.55;
}

.menu-document__open {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-self: center;
  gap: 0.45rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--menu-radius-control);
  background: var(--menu-primary);
  color: var(--menu-bg);
  font-weight: 800;
  text-decoration: none;
}

.menu-document__open:hover {
  filter: brightness(1.08);
}

.menu-document__open:focus-visible {
  outline: 2px solid var(--menu-secondary);
  outline-offset: 3px;
}
</style>
