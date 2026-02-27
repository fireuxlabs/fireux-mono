<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Service Entry (QR)</div>
        <p class="text-xs text-dimmed">
          Small QR presets for testing.
        </p>
      </div>
    </template>

    <UAlert
      v-if="!serviceMenuBaseUrl"
      color="neutral"
      variant="soft"
      title="No kitchen selected"
      description="Select a runtime kitchen before generating QR codes."
    />

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="qr in qrList"
        :key="qr.label"
        class="rounded border border-default p-2.5 text-center space-y-2"
      >
        <div class="text-xs font-semibold">
          {{ qr.label }}
        </div>

        <div class="flex justify-center">
          <div
            class="relative"
            :style="{ width: `${sizePx}px`, height: `${sizePx}px` }"
          >
            <img
              class="h-full w-full rounded border border-default bg-white p-1"
              :src="qrDataUrlByLabel[qr.label] || ''"
              :alt="`QR · ${qr.label}`"
              loading="lazy"
            />
          </div>
        </div>

        <div class="text-[10px] font-mono break-all text-dimmed">
          {{ qr.url }}
        </div>

        <div class="flex justify-end">
          <UButton
            size="xs"
            variant="soft"
            icon="i-lucide-external-link"
            :to="qr.url"
            target="_blank"
          >
            Visit
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { toDataURL } from 'qrcode'
import { computed, ref, watch } from 'vue'
import { useRuntimeKitchen } from '../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

type QrItem = {
  label: string
  url: string
}

const props = withDefaults(defineProps<{
  size?: number
}>(), {
  size: 84,
})

const runtime = useRuntimeKitchen()

const sizePx = computed(() => {
  const n = Number(props.size || 84)
  if (!Number.isFinite(n)) return 84
  return Math.max(64, Math.min(160, Math.round(n)))
})

const consoleKitchenId = computed(() =>
  String(runtime.id.value || '').trim()
)

const serviceMenuBaseUrl = computed(() => {
  if (!consoleKitchenId.value) return ''
  return `/kitchens/${encodeURIComponent(consoleKitchenId.value)}/menu`
})

const withQuery = (base: string, query: Record<string, string>) => {
  const url = new URL(base, 'http://localhost')
  Object.entries(query).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  return `${url.pathname}${url.search}`
}

const toAbsoluteUrl = (value: string) => {
  const path = String(value || '').trim()
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (import.meta.client) return `${window.location.origin}${path}`
  return path
}

const qrList = computed<QrItem[]>(() => {
  if (!serviceMenuBaseUrl.value) return []

  return [
    { label: 'Dine-in', url: toAbsoluteUrl(withQuery(serviceMenuBaseUrl.value, { mode: 'dine_in' })) },
    { label: 'Table 1', url: toAbsoluteUrl(withQuery(serviceMenuBaseUrl.value, { mode: 'dine_in', table: '1' })) },
    { label: 'Delivery', url: toAbsoluteUrl(withQuery(serviceMenuBaseUrl.value, { mode: 'delivery' })) },
    { label: 'Collection', url: toAbsoluteUrl(withQuery(serviceMenuBaseUrl.value, { mode: 'collection' })) },
  ]
})

const qrDataUrlByLabel = ref<Record<string, string>>({})

watch(
  [qrList, sizePx],
  async ([nextList, nextSize]) => {
    if (!import.meta.client) return
    if (!nextList.length) {
      qrDataUrlByLabel.value = {}
      return
    }

    const qrWidth = Math.max(160, nextSize * 2)

    const entries = await Promise.all(
      nextList.map(async (entry) => {
        try {
          const dataUrl = await toDataURL(entry.url, {
            width: qrWidth,
            margin: 2,
            errorCorrectionLevel: 'H',
          })
          return [entry.label, dataUrl] as const
        } catch {
          return [entry.label, ''] as const
        }
      })
    )

    qrDataUrlByLabel.value = Object.fromEntries(entries)
  },
  { immediate: true }
)
</script>
