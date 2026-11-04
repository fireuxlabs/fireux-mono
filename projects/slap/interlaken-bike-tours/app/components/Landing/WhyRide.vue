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

<template>
  <section class="why-section section">
    <div class="why-inner wrap">
      <div class="why-heading">
        <p class="eyebrow">02 / Why ride with us</p>
        <h2>One guide. Your group.<br />The whole valley.</h2>
      </div>
      <div class="reasons-grid">
        <article v-for="reason in reasons" :key="reason.number" class="reason">
          <p class="reason-number">{{ reason.number }}</p>
          <h3>{{ reason.title }}</h3>
          <p>{{ reason.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
