<template>
  <UCard
    variant="subtle"
    class="w-full"
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
          <h2 class="text-lg font-semibold text-highlighted">
            {{ data?.tool.title }}
          </h2>
          <UBadge
            label="/api/tools/text"
            color="neutral"
            variant="soft"
          />
        </div>
        <p class="text-sm leading-6 text-muted">
          {{ data?.tool.description }}
        </p>
      </div>

      <p class="text-sm leading-6 text-muted">
        {{ data?.tool.message }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const { data } = await useFetch(`${providerBaseUrl}/api/tools/text`)
</script>
