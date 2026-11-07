<template>
  <UPageHero title="Kjordy">
    <template #headline>
      <UAvatar src="/img/app/logo.png" alt="Kjordy" size="3xl" />
    </template>
    <ShareProfilePublicLinks />
  </UPageHero>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Kjordy',
  description: 'Kjordy',
})
</script>
