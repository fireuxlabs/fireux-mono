<template>
  <UPage>
    <UPageHeader title="Your menu request" />
    <UPageBody><MenuExpressRequest :request-id="id" /></UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const id = useRouteParam('id')
definePageMeta({ title: 'Menu request', layout: 'default' })
useSeoMeta({
  title: 'Your menu request · Misebox',
  robots: 'noindex, nofollow',
})
</script>
