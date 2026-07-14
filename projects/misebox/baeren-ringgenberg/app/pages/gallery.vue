<template>
  <BaerenRinggenbergPage>
    <BaerenRinggenbergHero
      :title="pageTitle"
      :subtitle="pageSubtitle"
    >
      <BaerenRinggenbergGalleryPreview />
    </BaerenRinggenbergHero>
  </BaerenRinggenbergPage>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../config/content.config'

// Tenant content page spine: docs/concepts/family-tenant-global.md
const page = baerenRinggenbergContent.pages.gallery
const pageTitle = page.title
const pageSubtitle = page.subtitle

definePageMeta({
  layout: 'baeren-default',
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
