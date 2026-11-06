<template>
  <UPageSection
    title="One guide. Your group. The whole valley."
    headline="Why ride with us"
  >
    <UPageGrid
      ><UPageCard
        v-for="reason in reasons"
        :key="reason.number"
        :title="reason.title"
        :description="reason.description"
    /></UPageGrid>
  </UPageSection>
</template>
<script setup lang="ts">
const reasons = [
  {
    number: '01',
    title: 'Private, always',
    description:
      'No strangers in the group and no fixed script. Ride at your pace and stop where you want.',
  },
  {
    number: '02',
    title: 'A guide who knows the valley',
    description:
      'Ride with the person who knows the valley — the shortcuts, the photo spots, and the café worth stopping at.',
  },
  {
    number: '03',
    title: 'Gear is sorted',
    description:
      'A bike and helmet are included on the listed rides, with a picnic on the longer tours.',
  },
  {
    number: '04',
    title: 'Same-day enquiries welcome',
    description:
      'Making plans at the last minute? Ask Ben if there is a ride available.',
  },
]
</script>
