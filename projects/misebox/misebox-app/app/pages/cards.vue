<template>
  <CardStyleLab />
  <OtherCards />
</template>

<script setup lang="ts">
import CardStyleLab from '../components/CardStyleLab.vue'

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Misebox Cards',
  description: 'A plain specimen list of existing Misebox card components.',
  robots: 'noindex, nofollow',
})
</script>
