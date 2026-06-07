<template>
  <footer class="misebox-tenant-footer">
    <a
      href="https://misebox.app"
      target="_blank"
      rel="noopener noreferrer"
      class="misebox-tenant-footer__powered"
      aria-label="Powered by Misebox"
    >
      <span>Powered by</span>
      <img
        src="/img/ecosystem/wordmark-light.svg"
        alt="Misebox"
        class="misebox-tenant-footer__wordmark"
      >
    </a>

    <DesignPaletteStrip
      v-if="showPalette"
      class="misebox-tenant-footer__palette"
      :palette="tenantPalette"
      aria-label="Tenant brand palette"
    />
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '#imports'
import type { PaletteStripColour } from 'fireux-core/runtime/types/design'

const appConfig = useAppConfig() as {
  miseboxTenant?: {
    palette?: readonly PaletteStripColour[]
  }
}

const isDev = import.meta.dev
const tenantPalette = computed(
  () => appConfig.miseboxTenant?.palette ?? []
)
const showPalette = computed(
  () => isDev && tenantPalette.value.length > 0
)
</script>

<style scoped>
.misebox-tenant-footer {
  position: absolute;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1rem, 3vw, 2rem);
  left: clamp(1rem, 3vw, 2rem);
  z-index: 2;
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}

.misebox-tenant-footer__powered {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  padding: 0.45rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--brand-canvas, white) 22%, transparent);
  border-radius: 999px;
  background: rgb(42 14 7 / 54%);
  color: var(--brand-canvas, white);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  line-height: 1;
  text-decoration: none;
  text-transform: uppercase;
  backdrop-filter: blur(14px);
}

.misebox-tenant-footer__wordmark {
  display: block;
  width: auto;
  height: 0.8rem;
}

.misebox-tenant-footer__palette {
  width: min(760px, 100%);
}
</style>
