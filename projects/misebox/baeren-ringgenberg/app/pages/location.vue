<template>
  <BaerenRinggenbergPage>
    <BaerenRinggenbergHero
      :title="pageTitle"
      :subtitle="pageSubtitle"
    >
      <BaerenRinggenbergMap />
    </BaerenRinggenbergHero>
  </BaerenRinggenbergPage>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../config/content.config'

// Tenant content page spine: docs/concepts/family-tenant-global.md
const page = baerenRinggenbergContent.pages.location
const pageTitle = page.title
const pageSubtitle = baerenRinggenbergContent.brand.address

definePageMeta({
  layout: 'baeren-default',
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
