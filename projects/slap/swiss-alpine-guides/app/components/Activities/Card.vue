<template>
  <article class="activity-card">
    <NuxtLink :to="activity.path" class="activity-card__image" :aria-label="`View ${activity.name}`">
      <img v-if="activity.image" :src="activity.image" :alt="`${activity.name} — photograph from the operator’s original site`" width="900" height="600" loading="lazy" decoding="async" />
      <span v-else>{{ activity.legacy ? 'Original-site listing' : 'Swiss Alpine Guides' }}</span>
    </NuxtLink>
    <div class="activity-card__body">
      <p class="activity-card__season">{{ activity.seasons.join(' · ') }}<span v-if="activity.legacy"> · Confirm operation</span></p>
      <h3><NuxtLink :to="activity.path">{{ activity.name }}</NuxtLink></h3>
      <p>{{ activity.summary }}</p>
      <UButton :to="activity.path" color="neutral" variant="outline" :aria-label="`Explore ${activity.name}`">Explore activity ↗</UButton>
    </div>
  </article>
</template>
<script setup lang="ts">
import type { Activity } from '~/content/activities'
defineProps<{ activity: Activity }>()
</script>
<style scoped>
.activity-card { overflow: hidden; border: 1px solid #d4dcd6; border-radius: 18px; background: #fff; display: flex; flex-direction: column; }
.activity-card__image { display: block; aspect-ratio: 3 / 2; overflow: hidden; background: #dfe7df; }
.activity-card__image img { width: 100%; height: 100%; object-fit: cover; }
.activity-card__image > span { display: grid; height: 100%; place-items: center; color: #53676c; font-size: .85rem; }
.activity-card__body { padding: 24px; display: flex; flex-direction: column; gap: 14px; flex: 1; }
.activity-card__body h3 { font: 400 27px/1.15 Georgia, serif; letter-spacing: -.025em; }
.activity-card__body > p:not(.activity-card__season) { font-size: 13px; line-height: 1.8; color: #53676c; }
.activity-card__season { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #53676c; }
.activity-card__body > a:last-child { margin-top: auto; align-self: start; }
</style>
