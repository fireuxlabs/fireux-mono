<template>
  <div v-if="qrOnly" class="aspect-square w-full bg-white p-3">
    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      :alt="`QR code for ${normalizedUrl}`"
      class="size-full"
    />
  </div>

  <GoQrProviderFrame
    v-else
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/url"
  >
    <form class="pagebody" @submit.prevent="createQr">
      <UFormField
        :label="urlLabel"
        :help="validUrl ? urlMessage : undefined"
        :error="!validUrl ? urlMessage : undefined"
      >
        <UInput v-model="urlInput" :placeholder="urlPlaceholder" />
      </UFormField>

      <UButton
        type="submit"
        icon="i-lucide-qr-code"
        block
        :disabled="!validUrl"
      >
        {{ ctaLabel }}
      </UButton>
    </form>

    <div v-if="qrDataUrl" class="pagebody">
      <div class="relative aspect-square w-full bg-white p-3">
        <img
          :src="qrDataUrl"
          :alt="`QR code for ${normalizedUrl}`"
          class="size-full"
        />
        <UBadge
          v-if="qrCentreLabel"
          class="absolute left-1/2 top-1/2 size-[22%] -translate-x-1/2 -translate-y-1/2 border-[0.35rem] border-white"
          aria-hidden="true"
        >
          {{ qrCentreLabel }}
        </UBadge>
      </div>
      <div class="fx-card__actions">
        <UButton
          :href="qrDataUrl"
          :download="downloadName"
          icon="i-lucide-download"
        >
          {{ downloadLabel }}
        </UButton>
        <UButton
          :to="normalizedUrl"
          target="_blank"
          icon="i-lucide-external-link"
          variant="soft"
          color="neutral"
        >
          {{ openTargetLabel }}
        </UButton>
      </div>
    </div>
  </GoQrProviderFrame>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { generateQR } from 'modqr'

type UrlToolConfig = {
  copy?: {
    title?: string
    description?: string
    ctaLabel?: string
    downloadLabel?: string
    openTargetLabel?: string
  }
  url?: {
    label?: string
    placeholder?: string
    initialValue?: string
    autoGenerate?: boolean
    invalidMessage?: string
  }
  qr?: {
    centreLabel?: string
  }
  presentation?: {
    qrOnly?: boolean
  }
}

const props = withDefaults(
  defineProps<{
    tool?: UrlToolConfig | null
  }>(),
  {
    tool: null,
  }
)

const urlInput = ref('')
const qrDataUrl = ref('')
const text = (value: unknown) => String(value ?? '').trim()

const toolTitle = computed(() => text(props.tool?.copy?.title))
const toolDescription = computed(() => text(props.tool?.copy?.description))
const urlLabel = computed(() => text(props.tool?.url?.label))
const urlPlaceholder = computed(() => text(props.tool?.url?.placeholder))
const ctaLabel = computed(() => text(props.tool?.copy?.ctaLabel))
const downloadLabel = computed(() => text(props.tool?.copy?.downloadLabel))
const openTargetLabel = computed(() => text(props.tool?.copy?.openTargetLabel))
const qrCentreLabel = computed(() => text(props.tool?.qr?.centreLabel))
const qrOnly = computed(() => props.tool?.presentation?.qrOnly === true)
const normalizedUrl = computed(() => normalizeUrl(urlInput.value))
const validUrl = computed(() => Boolean(normalizedUrl.value))
const urlMessage = computed(() => {
  if (!urlInput.value.trim()) return ''
  return validUrl.value
    ? normalizedUrl.value
    : text(props.tool?.url?.invalidMessage)
})
const downloadName = computed(() => {
  const parsed = normalizedUrl.value ? new URL(normalizedUrl.value) : null
  const host =
    parsed?.protocol === 'mailto:' ? 'email' : parsed?.hostname || 'url'
  return `go-qr-${host.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.svg`
})

watch(
  () => text(props.tool?.url?.initialValue),
  async (value) => {
    if (urlInput.value || !value) return
    urlInput.value = value
    if (props.tool?.url?.autoGenerate) await createQr()
  },
  { immediate: true }
)

async function createQr() {
  if (!import.meta.client || !validUrl.value) return
  const { svg } = generateQR(normalizedUrl.value, {
    renderer: 'svg',
    size: 1024,
    margin: 4,
    errorCorrection: 'H',
    style: 'liquid',
    finderStyle: 'extra-rounded',
    foreground: '#17132f',
    finderColor: '#5b3df5',
    background: '#ffffff',
  })
  if (!svg) throw new Error('QR SVG could not be created.')
  qrDataUrl.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const candidate = /^(?:mailto:|[a-z][a-z0-9+.-]*:\/\/)/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return ''
    if (
      url.protocol === 'mailto:' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url.pathname)
    )
      return ''
    return url.toString()
  } catch {
    return ''
  }
}
</script>
