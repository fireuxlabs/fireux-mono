<template>
  <section class="fx-page-stack" aria-label="Menu for review">
    <h2>{{ review.name }}</h2>
    <p v-if="review.description">{{ review.description }}</p>
    <section
      v-for="section in review.sections"
      :key="section.id"
      class="fx-page-stack"
    >
      <h3>{{ section.label }}</h3>
      <article v-for="item in section.items" :key="item.id">
        <h4>
          {{ item.name }} · {{ review.currency }} {{ item.price.toFixed(2) }}
        </h4>
        <p>{{ item.description }}</p>
        <p v-for="option in item.options" :key="option.label">
          {{ option.label }} · {{ review.currency }}
          {{ option.price.toFixed(2) }}
        </p>
      </article>
    </section>
  </section>
</template>
<script setup lang="ts">
import type { MenuExpressReview } from '../../../shared/types/menu-express'
defineProps<{ review: MenuExpressReview }>()
</script>
