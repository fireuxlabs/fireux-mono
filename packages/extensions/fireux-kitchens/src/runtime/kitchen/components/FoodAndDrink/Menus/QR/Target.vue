<template>
  <section class="menu-qr-entry">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-highlighted">
        {{ target.label }}
      </h3>
      <p class="text-xs text-dimmed">{{ target.description }}</p>
    </div>

    <div
      :ref="(element) => { qrContainer = element as HTMLElement | null }"
      class="menu-qr-code"
      :aria-busy="!qrReady && !qrError"
      :aria-label="`QR code for ${target.label}`"
    />

    <p v-if="qrError" role="alert">QR code unavailable. Use Open below.</p>
    <p v-else-if="!qrReady" role="status">Creating QR code…</p>
    <code>{{ target.path }}</code>

    <UButton
      :to="target.url"
      target="_blank"
      color="neutral"
      variant="soft"
      icon="i-lucide-external-link"
      size="sm"
    >
      Open
    </UButton>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MenuQrTarget } from '../../../../models/menu-qr-presentation.model'
import { useMenuQrRenderer } from '../../../../../menu/composables/useMenuQrRenderer'
const props = defineProps<{ target: MenuQrTarget }>()
const { qrContainer, qrReady, qrError } = useMenuQrRenderer(
  computed(() => props.target.url),
  ref(null),
  ref(false),
  { size: 176, margin: 8 }
)
</script>

<style scoped>
.menu-qr-entry {
  display: grid;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg);
}

.menu-qr-code {
  display: grid;
  place-items: center;
  width: min(100%, 12rem);
  aspect-ratio: 1;
  padding: calc(var(--spacing) * 2);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: #ffffff;
}

.menu-qr-code :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.menu-qr-entry code {
  width: fit-content;
  max-width: 100%;
  overflow-wrap: anywhere;
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-muted);
  color: var(--ui-text-highlighted);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  padding: var(--spacing) 0.45rem;
}
</style>
