<template>
  <BaerenRinggenbergPage variant="landing">
    <BaerenRinggenbergMenuReveal />
  </BaerenRinggenbergPage>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../config/content.config'

const page = baerenRinggenbergContent.pages.index

definePageMeta({
  layout: 'baeren-default',
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
