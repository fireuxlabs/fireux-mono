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
    icon: 'i-lucide-cable',
    text: 'Nuxt 4 + Firebase orchestration out of the box',
  },
  {
    icon: 'i-lucide-layout-dashboard',
    text: 'Reusable design system &amp; shared components',
  },
  {
    icon: 'i-lucide-layers-2',
    text: 'Tenant-aware &amp; white-label runtime',
  },
  { icon: 'i-lucide-zap', text: 'Automations, PWA, and CI presets' },
]
</script>
