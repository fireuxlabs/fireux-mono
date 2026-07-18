<template>
  <section class="menu-qr-entry">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-highlighted">
        {{ target.label }}
      </h3>
      <p class="text-xs text-dimmed">{{ target.description }}</p>
    </div>

    <div
      ref="qrContainer"
      class="menu-qr-code"
      :aria-label="`QR code for ${target.label}`"
    />

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
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type QRCodeStyling from 'qr-code-styling'
import type { Options as QRCodeStylingOptions } from 'qr-code-styling'
import type { MenuQrTarget } from './types'

const props = defineProps<{
  target: MenuQrTarget
}>()

const qrContainer = ref<HTMLElement | null>(null)
let currentQr: Pick<QRCodeStyling, 'append' | 'update'> | null = null

onMounted(renderQr)

onBeforeUnmount(() => {
  currentQr = null
})

watch(
  () => props.target.url,
  renderQr
)

async function renderQr() {
  if (!import.meta.client) return

  await nextTick()

  if (!qrContainer.value) return

  const options = qrOptions(props.target.url)

  if (currentQr) {
    currentQr.update(options)
    return
  }

  const QRCodeStyling = (await import('qr-code-styling')).default
  currentQr = new QRCodeStyling(options)
  qrContainer.value.replaceChildren()
  currentQr.append(qrContainer.value)
}

function qrOptions(data: string): Partial<QRCodeStylingOptions> {
  return {
    width: 176,
    height: 176,
    type: 'svg',
    data,
    margin: 8,
    qrOptions: {
      errorCorrectionLevel: 'H',
    },
    dotsOptions: {
      color: '#111827',
      type: 'rounded',
      roundSize: true,
    },
    cornersSquareOptions: {
      color: '#111827',
      type: 'extra-rounded',
    },
    cornersDotOptions: {
      color: '#111827',
      type: 'dot',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.28,
      margin: 4,
      crossOrigin: 'anonymous',
    },
  }
}
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
  font-weight: 800;
  padding: var(--spacing) 0.45rem;
}
</style>
