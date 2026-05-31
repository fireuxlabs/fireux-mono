<template>
  <UCard
    variant="subtle"
    class="mx-auto w-full max-w-xl"
  >
    <div class="space-y-4">
      <a
        href="https://go-qr.web.app"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-highlighted"
      >
        <img
          src="https://go-qr.web.app/img/app/logo.svg"
          alt="Go QR"
          class="size-4"
        >
        <span>Powered by Go QR</span>
      </a>

      <div class="space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-lg font-semibold text-highlighted">
            {{ tool?.title }}
          </h1>
          <UBadge
            label="/api/tools/doc"
            color="neutral"
            variant="soft"
          />
        </div>
        <p class="text-sm leading-6 text-muted">
          {{ tool?.description }}
        </p>
      </div>

      <UFormField label="Doc file">
        <UFileUpload
          accept="application/pdf,image/*,.doc,.docx"
          variant="area"
          size="xl"
          class="w-full"
        />
        <p class="mt-1 text-xs text-muted">
          PDF, image, DOC, or DOCX. Max 10 MB.
        </p>
      </UFormField>

      <UFormField label="Doc path">
        <UInput
          model-value=""
          placeholder="my-doc"
          class="w-full"
        />
        <p class="mt-1 break-all text-xs text-muted">
          {{ previewUrl }}
        </p>
      </UFormField>

      <UButton
        icon="i-lucide-qr-code"
        block
      >
        Create doc QR
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const { data: response } = await useFetch(`${providerBaseUrl}/api/tools/doc`)
const tool = computed(() => response.value?.tool)
const previewUrl = computed(() => {
  if (!tool.value?.preview) return ''

  return `${tool.value.preview.base_url}/my-doc${tool.value.preview.path_suffix}`
})

useSeoMeta({
  title: 'QR menu',
  ogTitle: 'QR menu',
  twitterTitle: 'QR menu',
  description: 'hello world',
  ogDescription: 'hello world',
  twitterDescription: 'hello world',
})
</script>
