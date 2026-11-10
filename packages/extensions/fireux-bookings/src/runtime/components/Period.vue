<template>
  <dl class="booking-period">
    <div>
      <dt>Start</dt>
      <dd>
        <time v-if="startAt" :datetime="startAt">{{
          startAt.replace('T', ' · ')
        }}</time>
        <span v-else>Not set</span>
      </dd>
    </div>
    <div>
      <dt>End</dt>
      <dd>
        <time v-if="endAt" :datetime="endAt">{{
          endAt.replace('T', ' · ')
        }}</time>
        <span v-else>Not set</span>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
defineProps<{ startAt: string; endAt: string }>()
</script>

<style scoped>
.booking-period {
  display: grid;
  gap: var(--spacing);
}

.booking-period dt {
  color: var(--ui-text-muted);
}

.booking-period dd {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
