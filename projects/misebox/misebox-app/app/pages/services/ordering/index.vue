<template>
  <section class="pagebody">
    <NuxtLink to="/services">Services</NuxtLink>
    <h1 class="fx-type-page-title">Website menu</h1>
    <p class="fx-type-description">
      Let customers browse your published menus from your website.
    </p>
    <UButton
      to="/workspace/kitchen/settings/integrations"
      label="Set up your website menu"
    />
  </section>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'landing', requiresAuth: false })
useSeoMeta({ title: 'Website menu | Misebox' })
</script>
