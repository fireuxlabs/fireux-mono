<template>
  <div class="space-y-4 rounded-lg border border-default bg-muted/20 p-4 sm:p-5">
    <UFormField :label="inputLabel">
      <UInput
        v-model="rawValue"
        :placeholder="placeholder"
        class="w-full"
      />
      <p
        v-if="statusMessage"
        class="mt-1 text-xs"
        :class="isValid ? 'text-muted' : 'text-error'"
      >
        {{ statusMessage }}
      </p>
    </UFormField>

    <div
      class="grid aspect-square w-full max-w-sm place-items-center rounded-md border border-default bg-white p-4"
    >
      <img
        v-if="qrDataUrl"
        :src="qrDataUrl"
        :alt="`${title} QR code`"
        class="size-full object-contain"
      >
      <p
        v-else
        class="text-center text-sm text-muted"
      >
        Enter a valid value
      </p>
    </div>

    <code
      v-if="payload"
      class="block break-all rounded-md bg-default px-3 py-2 text-xs text-muted"
    >
      {{ payload }}
    </code>

    <div class="flex flex-wrap gap-2">
      <UButton
        icon="i-lucide-copy"
        color="neutral"
        variant="soft"
        :disabled="!payload"
        @click="copyPayload"
      >
        Copy value
      </UButton>

      <a
        v-if="qrDataUrl"
        :href="qrDataUrl"
        :download="downloadName"
        class="inline-flex items-center justify-center gap-2 rounded-md border border-default px-3 py-2 text-sm font-medium text-highlighted hover:bg-muted"
      >
        <UIcon name="i-lucide-download" class="size-4" />
        Download QR
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { toDataURL } from 'qrcode'

type InstantQrType = 'url' | 'phone'

const props = defineProps<{
  type: InstantQrType
  title: string
  inputLabel: string
  placeholder: string
}>()

const rawValue = ref('')
const qrDataUrl = ref('')
const copyState = ref('')

const payload = computed(() => {
  if (props.type === 'phone') return phonePayload(rawValue.value)
  return urlPayload(rawValue.value)
})

const isValid = computed(() => Boolean(payload.value))
const statusMessage = computed(() => {
  if (copyState.value) return copyState.value
  if (!rawValue.value.trim()) return ''
  return isValid.value ? 'Ready to scan.' : 'Enter a valid value.'
})
const downloadName = computed(() =>
  `${props.type}-qr-code.png`
)

function urlPayload(value: string) {
  const raw = value.trim()
  if (!raw) return ''

  const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(raw)
    ? raw
    : `https://${raw}`

  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.toString()
  } catch {
    return ''
  }
}

function phonePayload(value: string) {
  const phone = value
    .trim()
    .replace(/[\s().-]+/g, '')

  if (!/^\+?\d{5,15}$/.test(phone)) return ''
  return `tel:${phone}`
}

async function renderQr() {
  if (!payload.value) {
    qrDataUrl.value = ''
    return
  }

  qrDataUrl.value = await toDataURL(payload.value, {
    errorCorrectionLevel: 'H',
    width: 900,
    margin: 2,
    color: {
      dark: '#24134f',
      light: '#ffffff',
    },
  })
}

async function copyPayload() {
  if (!payload.value || typeof navigator === 'undefined') return
  await navigator.clipboard.writeText(payload.value)
  copyState.value = 'Copied.'
  window.setTimeout(() => {
    copyState.value = ''
  }, 1600)
}

onMounted(() => {
  watch(payload, renderQr, { immediate: true })
})
</script>
