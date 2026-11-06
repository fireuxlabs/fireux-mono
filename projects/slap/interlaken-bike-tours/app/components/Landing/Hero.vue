<template>
  <UPageHero
    headline="Interlaken · Bernese Oberland"
    title="Command the Alps."
    description="Private guided bike and e-bike tours from Interlaken. Ride at your own pace through Lauterbrunnen, along Lake Brienz, or to Giessbach Falls."
    :links="links"
  >
    <img
      src="/images/lake.webp"
      alt="Lake Thun and the mountains around Interlaken"
      width="1600"
      height="1600"
      fetchpriority="high"
    />
  </UPageHero>
</template>
<script setup lang="ts">
const links = [
  { label: 'See the tours', to: '/#tours', icon: 'i-lucide-arrow-down' },
  {
    label: 'Check availability',
    to: '/book',
    color: 'neutral' as const,
    variant: 'outline' as const,
  },
]
</script>
