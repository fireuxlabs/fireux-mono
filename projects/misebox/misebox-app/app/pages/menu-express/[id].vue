<template>
  <UPage>
    <UPageHeader title="Your menu request" />
    <UPageBody><MenuExpressRequest :request-id="id" /></UPageBody>
  </UPage>
</template>
<script setup lang="ts">
const route = useRoute()
const id = computed(() => String(route.params.id || ''))
definePageMeta({ title: 'Menu request', layout: 'default' })
useSeoMeta({
  title: 'Your menu request · Misebox',
  robots: 'noindex, nofollow',
})
</script>
