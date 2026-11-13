<template>
  <UHeader v-model:open="open" title="Swiss Alpine Guides" to="/" mode="slideover" class="alpine-header">
    <template #title><span class="alpine-header__brand">Swiss Alpine Guides</span></template>
    <UNavigationMenu :items="items" aria-label="Main navigation" />
    <template #right><UButton class="alpine-header__enquire" to="/#enquire" color="neutral" label="Enquire" /></template>
    <template #body><UNavigationMenu :items="items" orientation="vertical" aria-label="Mobile navigation" /></template>
  </UHeader>
</template>
<script setup lang="ts">
const open = ref(false)
const items = [
  { label: 'Home', to: '/', exact: true, exactHash: true },
  { label: 'Tours', to: '/#tours', exactHash: true },
  { label: 'Tour information', to: '/#mountains', exactHash: true },
  { label: 'Contact', to: '/#enquire', exactHash: true },
].map(item => ({ ...item, onSelect: () => { open.value = false } }))
</script>
<style scoped>
.alpine-header { background: #f3f3efed; border-color: #cdd5d1; }
.alpine-header__brand { font: 400 clamp(1.05rem, 2vw, 1.3rem)/1.1 Georgia, serif; letter-spacing: -.025em; color: #142d35; }
@media (max-width: 380px) { .alpine-header__enquire { display: none; } }
</style>
