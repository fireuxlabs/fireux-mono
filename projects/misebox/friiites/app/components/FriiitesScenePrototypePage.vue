<template>
  <UPage class="friiites-page">
    <main id="top">
      <FriiitesHeroScene :mobile-composition="composition" />
    </main>
  </UPage>
</template>

<script setup lang="ts">
defineProps<{
  composition: '1' | '2' | '3' | '4' | '5'
}>()
</script>
