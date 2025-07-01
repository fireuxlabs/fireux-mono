<template>
  <div>
    <h1>Hello Jobs</h1>
    <p>This is the jobs listing page.</p>
  </div>
</template>

<script setup>


definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: label || 'Jobs',
  meta: [{ name: 'icon', content: icon || 'i-lucide-briefcase' }],
})
</script>
