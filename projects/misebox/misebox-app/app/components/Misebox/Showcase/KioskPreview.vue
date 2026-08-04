<!-- Concurrent edit — 2026-07-23 13:42 CEST — Bare preview surface: replace the Nuxt UI modal with a literal Kiosk canvas and independent floating controls. -->
<!-- Concurrent edit — 2026-07-23 13:57 CEST — Popup layer restoration: retain UModal behaviour through a transparent full-screen shell with no visible wrapper. -->
<template>
  <UModal
    v-model:open="open"
    title="1080 by 1920 Kiosk demo"
    description="Interactive preview at actual CSS size."
    :ui="{
      overlay: 'showcase-kiosk-preview-overlay',
      content: 'showcase-kiosk-preview-shell',
      header: 'sr-only',
      body: 'showcase-kiosk-preview-body',
    }"
  >
    <template #body>
      <div ref="scrollSurface" class="showcase-kiosk-preview__scroll">
        <button
          type="button"
          class="showcase-kiosk-preview__close"
          aria-label="Close Kiosk demo"
          @click="open = false"
        >
          <UIcon name="i-lucide-x" aria-hidden="true" />
        </button>

        <div class="showcase-kiosk-preview__layout">
          <div
            class="showcase-kiosk-preview__stage"
            data-demo-kiosk-preview-dialog
          >
            <iframe
              class="showcase-kiosk-preview__frame"
              :src="previewUrl"
              title="1080 by 1920 Kiosk demo"
              width="1080"
              height="1920"
            />
          </div>

          <nav class="showcase-kiosk-preview__menus" aria-label="Demo menus">
            <span>Demo menus</span>
            <button
              v-for="kitchen in kitchens"
              :key="kitchen.id"
              type="button"
              :class="{
                'showcase-kiosk-preview__menu--active':
                  kitchen.id === kitchenId,
              }"
              :aria-pressed="kitchen.id === kitchenId"
              @click="kitchenId = kitchen.id"
            >
              <strong>{{ kitchen.label }}</strong>
              <small>{{ kitchen.tagline }}</small>
            </button>
          </nav>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

type DemoKitchenOption = {
  id: string
  label: string
  tagline: string
}

defineProps<{
  kitchens: readonly DemoKitchenOption[]
}>()

const open = defineModel<boolean>('open', { default: false })
const kitchenId = defineModel<string>('kitchenId', { required: true })
const requestUrl = useRequestURL()
const scrollSurface = ref<HTMLDivElement | null>(null)

const previewUrl = computed(() => {
  const url = new URL('/demo/kiosk', requestUrl.origin)
  url.searchParams.set('viewport', '1080x1920')
  url.searchParams.set('embedded', '1')
  url.searchParams.set('kitchen', kitchenId.value)
  return url.toString()
})

watch(open, (isOpen: boolean) => {
  if (isOpen) void nextTick(() => scrollSurface.value?.scrollTo(0, 0))
})
</script>

<style scoped>
:global(.showcase-kiosk-preview-overlay) {
  background: rgb(9 14 26 / 94%);
  backdrop-filter: blur(0.2rem);
}

:global(.showcase-kiosk-preview-shell) {
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: none;
  height: 100dvh;
  max-height: none;
  overflow: auto;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  transform: none;
  translate: 0 0;
}

:global(.showcase-kiosk-preview-body) {
  position: relative;
  min-height: 100%;
  padding: 0;
  overflow: hidden;
  background: transparent;
}

.showcase-kiosk-preview__scroll {
  position: absolute;
  inset: 0;
  overflow: auto;
  padding: calc(var(--spacing) * 4);
  overscroll-behavior: contain;
}

.showcase-kiosk-preview__layout {
  display: grid;
  grid-template-columns: 1080px 15rem;
  align-items: start;
  width: max-content;
  gap: calc(var(--spacing) * 4);
  margin-inline: auto;
}

.showcase-kiosk-preview__stage,
.showcase-kiosk-preview__frame {
  width: 1080px;
  height: 1920px;
}

.showcase-kiosk-preview__stage {
  overflow: hidden;
  background: white;
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 35%);
}

.showcase-kiosk-preview__frame {
  display: block;
  max-width: none;
  border: 0;
}

.showcase-kiosk-preview__close {
  position: fixed;
  z-index: 2;
  top: max(1rem, env(safe-area-inset-top));
  right: max(1rem, env(safe-area-inset-right));
  display: grid;
  width: 3rem;
  height: 3rem;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 9999px;
  place-items: center;
  background: rgb(17 24 39 / 88%);
  box-shadow: 0 0.75rem 2rem rgb(0 0 0 / 28%);
  color: white;
  cursor: pointer;
  font: inherit;
  backdrop-filter: blur(0.75rem);
}

.showcase-kiosk-preview__close:focus-visible {
  outline: 3px solid white;
  outline-offset: 0.2rem;
}

.showcase-kiosk-preview__menus {
  position: sticky;
  top: 1rem;
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding: 0.65rem;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: calc(var(--ui-radius) * 4);
  background: rgb(17 24 39 / 88%);
  box-shadow: 0 1.25rem 3rem rgb(0 0 0 / 28%);
  color: white;
  backdrop-filter: blur(0.9rem);
}

.showcase-kiosk-preview__menus > span {
  padding: 0.45rem 0.65rem calc(var(--spacing) * 1);
  color: rgb(255 255 255 / 54%);
  font-size: 0.65rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.showcase-kiosk-preview__menus button {
  display: grid;
  gap: 0.2rem;
  width: 100%;
  padding: 0.8rem;
  border: 1px solid transparent;
  border-radius: calc(var(--ui-radius) * 3);
  background: transparent;
  color: rgb(255 255 255 / 72%);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.showcase-kiosk-preview__menus button:hover,
.showcase-kiosk-preview__menus button:focus-visible {
  background: rgb(255 255 255 / 8%);
  color: white;
}

.showcase-kiosk-preview__menus button:focus-visible {
  outline: 2px solid white;
  outline-offset: 0.1rem;
}

.showcase-kiosk-preview__menus button strong {
  color: inherit;
  font-size: 0.9rem;
}

.showcase-kiosk-preview__menus button small {
  color: rgb(255 255 255 / 48%);
  font-size: 0.7rem;
  line-height: 1.35;
}

.showcase-kiosk-preview__menus .showcase-kiosk-preview__menu--active {
  border-color: color-mix(in srgb, var(--ui-primary) 65%, white);
  background: var(--ui-primary);
  color: white;
}

.showcase-kiosk-preview__menus .showcase-kiosk-preview__menu--active small {
  color: rgb(255 255 255 / 72%);
}
</style>
