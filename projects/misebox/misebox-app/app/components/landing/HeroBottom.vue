<template>
  <ul class="landing-hero__bullets">
    <li
      v-for="(bullet, index) in bullets"
      :key="index"
      class="landing-hero__bullet"
    >
      <UIcon :name="bullet.icon" class="shrink-0" />
      <span v-html="bullet.text" />
    </li>
  </ul>
</template>

<script setup lang="ts">
const bullets = [
  {
    icon: 'i-lucide-briefcase',
    text: 'Post jobs and preview candidates',
  },
  {
    icon: 'i-lucide-user',
    text: 'Professional profiles instead of CVs',
  },
  {
    icon: 'i-lucide-chef-hat',
    text: 'Kitchen pages that attract the right people',
  },
  {
    icon: 'i-lucide-send',
    text: 'Contact candidates directly',
  },
]
</script>
