<template>
  <LaTapBernePage variant="landing">
    <LaTapBerneMenuReveal />
  </LaTapBernePage>
</template>

<script setup lang="ts">
import { laTapBerneContent } from '../config/content.config'

const page = laTapBerneContent.pages.index

definePageMeta({
  layout: 'latap-default',
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
