<template>
  <LaTapBernePage>
    <LaTapBerneHero
      :title="pageTitle"
      :subtitle="pageSubtitle"
    >
      <LaTapBerneCopy>
        <p
          v-for="copy in page.copy"
          :key="copy"
        >
          {{ copy }}
        </p>
      </LaTapBerneCopy>
    </LaTapBerneHero>
  </LaTapBernePage>
</template>

<script setup lang="ts">
import { laTapBerneContent } from '../config/content.config'

// Tenant content page spine: docs/concepts/family-tenant-global.md
const page = laTapBerneContent.pages.home
const pageTitle = page.title
const pageSubtitle = page.subtitle

definePageMeta({
  layout: 'latap-default',
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
