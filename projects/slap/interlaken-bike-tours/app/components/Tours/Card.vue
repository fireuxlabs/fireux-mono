<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  name: string
  label: string
  summary: string
  difficulty: string
  image: string
  alt: string
  duration: string
  distance?: string
  elevation?: string
  price?: number
  to: RouteLocationRaw
  action: string
}>()

const titleId = useId()
const actionId = useId()
</script>

<template>
  <article class="tour-card">
    <NuxtLink
      :to="to"
      class="tour-card-link"
      :aria-labelledby="`${actionId} ${titleId}`"
    >
      <div class="tour-image">
        <img
          :src="image"
          :alt="alt"
          loading="lazy"
          width="1600"
          height="1600"
        />
        <span class="tour-number">{{ difficulty }}</span>
      </div>
      <div class="tour-card-body">
        <p class="eyebrow">{{ label }}</p>
        <h3 :id="titleId">{{ name }}</h3>
        <p>{{ summary }}</p>
        <ul class="tour-meta">
          <li>{{ duration }}</li>
          <li v-if="distance">{{ distance }}</li>
          <li v-if="elevation">+{{ elevation }}</li>
        </ul>
        <div class="tour-card-footer">
          <p class="tour-price">
            <span>{{ price === undefined ? 'Price' : 'From per person' }}</span>
            <strong>{{
              price === undefined ? 'On request' : 'CHF ' + price
            }}</strong>
          </p>
          <span :id="actionId" class="text-link"
            >{{ action }} <span aria-hidden="true">↗</span></span
          >
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
