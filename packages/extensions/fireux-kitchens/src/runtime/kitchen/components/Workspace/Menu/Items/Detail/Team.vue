<template>
  <section aria-labelledby="item-training-heading">
    <h2 id="item-training-heading">Team training</h2>
    <pre>{{ JSON.stringify(training, null, 2) }}</pre>
  </section>
</template>

<script setup lang="ts">
const training = { trainedTeamMembers: null }
</script>
