<template>
  <GoQrToolsText v-if="slug === 'text'" class="max-w-xl" />
  <GoQrToolsDoc v-else-if="slug === 'doc'" class="max-w-xl" />
  <GoQrToolInstantPanel
    v-else-if="slug === 'url'"
    type="url"
    title="URL"
    input-label="URL"
    placeholder="https://example.com"
  />
  <GoQrToolInstantPanel
    v-else-if="slug === 'phone'"
    type="phone"
    title="Phone"
    input-label="Phone number"
    placeholder="+41790000000"
  />
  <GoQrToolPlaceholder
    v-else
    :name="name"
  />
</template>

<script setup lang="ts">
defineProps<{
  slug: string
  name: string
}>()
</script>
