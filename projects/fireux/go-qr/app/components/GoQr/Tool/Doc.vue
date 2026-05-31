<template>
  <GoQrSystemToolFrame
    :title="data?.tool.title"
    :description="data?.tool.description"
    endpoint="/api/tools/doc"
  >
    <p class="text-sm leading-6 text-muted">
      {{ data?.tool.message }}
    </p>
  </GoQrSystemToolFrame>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/tools/doc')
</script>
