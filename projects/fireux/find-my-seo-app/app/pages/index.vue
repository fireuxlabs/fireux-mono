<template>
  <UPage>
    <UPageHeader
      title="Connect your project with SEO professionals."
      description="Search-led profiles help you compare specialists by service, sector and proof."
    >
      <template #headline>
        <UBadge color="primary" variant="soft">
          SEO Professional Pool
        </UBadge>
      </template>

      <template #links>
        <UButton to="/get-started" color="primary" icon="i-lucide-search">
          Browse professionals
        </UButton>
        <UButton
          to="/dashboard/professional/profile"
          variant="soft"
          icon="i-lucide-user-plus"
        >
          Create a provider profile
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <FireLandingSolutions variant="preview" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
})
</script>
