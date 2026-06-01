<template>
  <GoQrSystemToolFrame
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/url"
  >
    <form
      class="space-y-4"
      @submit.prevent="createQr"
    >
      <UFormField :label="urlLabel">
        <UInput
          v-model="urlInput"
          :placeholder="urlPlaceholder"
          class="w-full"
        />
        <p
          v-if="urlMessage"
          class="mt-1 text-xs"
          :class="validUrl ? 'text-muted' : 'text-error'"
        >
          {{ urlMessage }}
        </p>
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

    <div
      v-if="qrDataUrl"
      class="space-y-3"
    >
      <div class="relative mx-auto aspect-square w-full max-w-80 rounded-md border border-default bg-white p-3">
        <img
          :src="qrDataUrl"
          :alt="`QR code for ${normalizedUrl}`"
          class="size-full"
        >
        <div
          v-if="qrCentreLabel"
          class="absolute left-1/2 top-1/2 grid size-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[22%] border-[0.35rem] border-white bg-[#4f2df4] px-1 text-center text-[clamp(0.45rem,4vw,1rem)] font-black uppercase leading-none text-white shadow-sm"
          aria-hidden="true"
        >
          {{ qrCentreLabel }}
        </div>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <UButton
          :href="qrDataUrl"
          :download="downloadName"
          icon="i-lucide-download"
        >
          Download QR
        </UButton>
        <UButton
          :to="normalizedUrl"
          target="_blank"
          icon="i-lucide-external-link"
          variant="soft"
          color="neutral"
        >
          Open URL
        </UButton>
      </div>
    </div>
  </GoQrSystemToolFrame>
</template>

<script setup lang="ts">
import { toDataURL } from 'qrcode'

type ToolResponse = {
  tool: {
    title: string
    description: string
  }
}

const { data } = await useFetch<ToolResponse>('/api/tools/url')

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  urlLabel?: string
  urlPlaceholder?: string
  ctaLabel?: string
  qrCentreLabel?: string
}>(), {
  title: '',
  description: '',
  urlLabel: 'URL',
  urlPlaceholder: 'https://example.com',
  ctaLabel: 'Create URL QR',
  qrCentreLabel: '',
})

const urlInput = ref('')
const qrDataUrl = ref('')

const toolTitle = computed(() => props.title || data.value?.tool.title || 'URL')
const toolDescription = computed(() =>
  props.description || data.value?.tool.description || ''
)
const normalizedUrl = computed(() => normalizeUrl(urlInput.value))
const validUrl = computed(() => Boolean(normalizedUrl.value))
const urlMessage = computed(() => {
  if (!urlInput.value.trim()) return ''
  return validUrl.value ? normalizedUrl.value : 'Enter a valid public URL.'
})
const downloadName = computed(() => {
  const host = normalizedUrl.value ? new URL(normalizedUrl.value).hostname : 'url'
  return `go-qr-${host.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`
})

async function createQr() {
  if (!validUrl.value) return

  qrDataUrl.value = await toDataURL(normalizedUrl.value, {
    errorCorrectionLevel: 'H',
    width: 1024,
    margin: 2,
    color: {
      dark: '#24134f',
      light: '#ffffff',
    },
  })
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    return url.toString()
  } catch {
    return ''
  }
}
</script>
