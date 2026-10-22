<script setup lang="ts">
import type { Tour } from '~/content/tours'
defineProps<{ tour: Tour; index: number }>()
</script>
<template>
  <article class="tour-card">
    <NuxtLink
      :to="'/tours/' + tour.slug"
      class="tour-image"
      :aria-label="'Explore ' + tour.name"
      ><img
        :src="tour.image"
        :alt="tour.alt"
        loading="lazy"
        width="800"
        height="650"
      /><span class="tour-number">0{{ index + 1 }}</span
      ><span class="tour-arrow" aria-hidden="true">↗</span></NuxtLink
    >
    <p class="eyebrow">{{ tour.label }}</p>
    <h3>
      <NuxtLink :to="'/tours/' + tour.slug">{{ tour.name }}</NuxtLink>
    </h3>
    <p>{{ tour.summary }}</p>
    <div class="tour-meta">
      <span
        >{{ tour.duration
        }}<template v-if="tour.distance"> · {{ tour.distance }}</template></span
      ><span
        >From <strong>CHF {{ tour.price }}</strong> / person</span
      >
    </div>
  </article>
</template>
