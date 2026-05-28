<template>
  <UCard variant="subtle">
    <template #header>
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-highlighted">
          {{ title }}
        </h2>
        <p class="text-sm leading-6 text-muted">
          {{ description }}
        </p>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent>
      <UFormField :label="inputLabel">
        <UTextarea
          v-if="type === 'qr'"
          v-model="rawValue"
          :placeholder="placeholder"
          :rows="4"
          class="w-full"
        />
        <UInput
          v-else
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

      <div class="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
        <div class="grid aspect-square w-full place-items-center rounded-md border border-default bg-white p-4">
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

        <div class="flex min-w-0 flex-col gap-3">
          <UBadge
            v-if="payload"
            :label="payload"
            color="neutral"
            variant="soft"
            size="sm"
            class="max-w-full font-mono"
          />

          <div class="grid gap-2">
            <UButton
              type="button"
              icon="i-lucide-copy"
              color="neutral"
              variant="soft"
              block
              :disabled="!payload"
              @click="copyPayload"
            >
              Copy value
            </UButton>

            <UButton
              v-if="qrDataUrl"
              :href="qrDataUrl"
              :download="downloadName"
              icon="i-lucide-download"
              block
            >
              Download QR
            </UButton>
          </div>
        </div>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { toDataURL } from 'qrcode'

type InstantQrType = 'qr' | 'url' | 'phone'

const props = defineProps<{
  type: InstantQrType
  title: string
  description?: string
  inputLabel: string
  placeholder: string
}>()

const rawValue = ref('')
const qrDataUrl = ref('')
const copyState = ref('')

const payload = computed(() => {
  if (props.type === 'qr') return rawValue.value.trim()
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
