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
    icon: 'i-lucide-calendar-range',
    text: 'Smart scheduling &amp; crew assignments',
  },
  {
    icon: 'i-lucide-clipboard-check',
    text: 'QA checklists with photo proof',
  },
  {
    icon: 'i-lucide-badge-check',
    text: 'Compliance &amp; certification tracking',
  },
  {
    icon: 'i-lucide-wallet-cards',
    text: 'Stripe-ready invoicing &amp; exports',
  },
]
</script>
