<template>
  <UHeader v-model:open="open" title="Swiss Alpine Guides" to="/" mode="slideover" class="alpine-header">
    <template #title><span class="alpine-header__brand">Swiss Alpine Guides</span></template>
    <UNavigationMenu color="neutral" :items="items" aria-label="Main navigation" />
    <template #right><UButton class="alpine-header__enquire" to="/contact" color="neutral" label="Enquire" /></template>
    <template #body><UNavigationMenu color="neutral" :items="items" orientation="vertical" aria-label="Mobile navigation" /></template>
  </UHeader>
</template>
<script setup lang="ts">
const open = ref(false)
const items = [
  { label: 'Home', to: '/', exact: true },
  { label: 'Activities', children: [
    { label: 'All activities', to: '/activities', onSelect: () => { open.value = false } },
    { label: 'Summer', to: '/summer', onSelect: () => { open.value = false } },
    { label: 'Winter', to: '/winter', onSelect: () => { open.value = false } },
    { label: 'Courses', to: '/courses', onSelect: () => { open.value = false } },
  ] },
  { label: 'Rentals', to: '/rentals' },
  { label: 'Vouchers', to: '/vouchers' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
].map(item => item.children ? item : { ...item, onSelect: () => { open.value = false } })
</script>
<style scoped>
.alpine-header { background: #f3f3efed; border-color: #cdd5d1; }
.alpine-header__brand { font: 400 clamp(1.05rem, 2vw, 1.3rem)/1.1 Georgia, serif; letter-spacing: -.025em; color: #142d35; }
@media (max-width: 380px) { .alpine-header__enquire { display: none; } }
</style>
