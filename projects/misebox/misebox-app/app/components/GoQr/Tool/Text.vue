<template>
  <GoQrSystemToolFrame>
    <p class="text-sm leading-6 text-muted">
      {{ data?.tool.message }}
    </p>
  </GoQrSystemToolFrame>
</template>

<script setup lang="ts">
const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const { data } = await useFetch(`${providerBaseUrl}/api/tools/text`)
</script>
