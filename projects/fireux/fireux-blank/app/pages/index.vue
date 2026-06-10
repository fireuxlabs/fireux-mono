<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="FireUX Blank"
      description="A clean app for shaping the shared console base."
    >
      <template #links>
        <UButton to="/console/blank" icon="i-lucide-circle-play">
          Open blank console
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UPageCard
        title="Blank console"
        description="Use this app to check the shared console pipeline before domain consoles plug into it."
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
    'A clean app for shaping the shared FireUX console base.',
})
</script>
