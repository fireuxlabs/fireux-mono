<template>
  <div>
    <LandingHero />
    <LandingSolutions />
    <LandingFireUX />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'landing' })
useSeoMeta({
  title: 'Tenant App',
  description: 'Tenant landing page',
})
</script>
