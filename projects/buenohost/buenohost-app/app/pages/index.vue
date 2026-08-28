<template>
  <LandingIndex />
</template>

<script setup lang="ts">
import LandingIndex from '../components/Landing/Index.vue'

definePageMeta({ layout: 'landing', nav: { key: 'home', label: 'Home', icon: 'i-lucide-home', desktop: true, mobile: true, layouts: ['landing'] } })
useSeoMeta({ title: 'BuenoHost', description: 'Publish digital guest guides and manage properties, reservations, and stay information from the Host Workspace.' })
</script>
