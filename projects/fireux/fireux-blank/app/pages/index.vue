<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="FireUX Blank"
      description="A clean app for shaping the shared workspace base."
    >
      <template #links>
        <UButton to="/workspace/blank" icon="i-lucide-circle-play">
          Open blank workspace
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UPageCard
        title="Blank workspace"
        description="Use this app to check the shared workspace pipeline before domain workspaces plug into it."
        variant="subtle"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'blank-home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'FireUX Blank',
  description:
    'A clean app for shaping the shared FireUX workspace base.',
})
</script>
