<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-6 sm:py-8">
      <div class="mx-auto max-w-5xl space-y-6">
        <header class="flex flex-col gap-4 border-b border-default pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="space-y-2">
            <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <UIcon name="i-lucide-arrow-left" class="size-4" />
              QRdoc
            </NuxtLink>
            <p class="text-sm font-semibold uppercase text-muted">
              {{ documentRecord.business_name }}
            </p>
            <h1 class="text-3xl font-semibold tracking-normal text-highlighted sm:text-4xl">
              {{ documentRecord.title }}
            </h1>
            <p class="max-w-2xl text-sm leading-6 text-muted sm:text-base">
              {{ documentRecord.description }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              :to="documentRecord.file_url"
              target="_blank"
              icon="i-lucide-external-link"
              color="primary"
            >
              Open original
            </UButton>
            <a
              :href="documentRecord.file_url"
              :download="documentRecord.file_name"
              class="inline-flex items-center justify-center gap-2 rounded-md border border-default px-3 py-2 text-sm font-medium text-highlighted hover:bg-elevated"
            >
              <UIcon name="i-lucide-download" class="size-4" />
              Download
            </a>
          </div>
        </header>

        <section class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]" aria-label="Document and QR code">
          <div class="overflow-hidden rounded-md border border-default bg-white">
            <img
              v-if="isImage"
              :src="documentRecord.file_url"
              :alt="documentRecord.title"
              class="w-full object-contain"
            >
            <iframe
              v-else
              :src="documentRecord.file_url"
              :title="documentRecord.title"
              class="h-[80vh] w-full"
            />
          </div>

          <aside class="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <UCard variant="subtle">
              <div class="space-y-4">
                <div>
                  <h2 class="font-semibold text-highlighted">
                    QR code
                  </h2>
                  <p class="mt-1 text-sm text-muted">
                    This QR opens the public document page.
                  </p>
                </div>

                <div class="rounded-md border border-default bg-white p-3">
                  <img
                    v-if="qrDataUrl"
                    :src="qrDataUrl"
                    :alt="`QR code for ${documentRecord.title}`"
                    class="mx-auto size-56"
                  >
                  <div
                    v-else
                    class="grid h-56 place-items-center text-sm text-slate-500"
                  >
                    Creating QR
                  </div>
                </div>

                <label class="block space-y-2 text-sm">
                  <span class="font-medium text-highlighted">Public link</span>
                  <input
                    :value="publicUrl"
                    readonly
                    class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-muted"
                  >
                </label>

                <UButton
                  icon="i-lucide-copy"
                  variant="soft"
                  block
                  @click="copyPublicLink"
                >
                  {{ copied ? 'Copied' : 'Copy link' }}
                </UButton>

                <UButton
                  icon="i-lucide-download"
                  variant="soft"
                  block
                  :disabled="!qrDataUrl"
                  @click="downloadQrCode"
                >
                  Download QR
                </UButton>
              </div>
            </UCard>

            <p class="text-center text-xs text-muted">
              Powered by QRdoc
            </p>
          </aside>
        </section>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toDataURL } from 'qrcode'
import { resolveQrdocDocument } from '../../demo/documents'

const route = useRoute()
const requestUrl = useRequestURL()
const copied = ref(false)
const qrDataUrl = ref('')

const documentRecord = resolveQrdocDocument(String(route.params.slug || ''))

if (!documentRecord) {
  throw createError({
    statusCode: 404,
    statusMessage: 'QRdoc document not found',
  })
}

const isImage = computed(() => documentRecord.file_type.startsWith('image/'))
const publicUrl = computed(() => `${requestUrl.origin}/d/${documentRecord.slug}`)

onMounted(async () => {
  const origin = window.location.origin
  qrDataUrl.value = await toDataURL(`${origin}/d/${documentRecord.slug}`, {
    width: 768,
    margin: 2,
  })
})

async function copyPublicLink() {
  if (!import.meta.client) return

  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1500)
}

function downloadQrCode() {
  if (!import.meta.client || !qrDataUrl.value) return

  const link = window.document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `${documentRecord.slug}-qr.png`
  link.click()
}

useSeoMeta({
  title: computed(() => `${documentRecord.title} · QRdoc`),
  description: computed(() => documentRecord.description),
})
</script>
