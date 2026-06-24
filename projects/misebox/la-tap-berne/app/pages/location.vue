<template>
  <LaTapBernePage>
    <LaTapBerneHero
      :title="pageTitle"
      :subtitle="pageSubtitle"
    >
      <LaTapBerneMap />
    </LaTapBerneHero>
  </LaTapBernePage>
</template>

<script setup lang="ts">
import { laTapBerneContent } from '../config/content.config'

// Tenant content page spine: docs/concepts/family-tenant-global.md
const page = laTapBerneContent.pages.location
const pageTitle = page.title
const pageSubtitle = laTapBerneContent.brand.address

definePageMeta({
  layout: 'latap-default',
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
