<template>
  <UPage>
    <UPageHeader
      title="Collection Ordering"
      description="Online ordering is paused."
    />
    <UPageBody>
      <UButton to="/menus" label="Browse menus" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', title: 'Collection Ordering' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
