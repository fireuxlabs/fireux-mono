<template>
  <UContainer class="py-12 sm:py-16">
    <div class="mx-auto grid max-w-3xl gap-8">
      <header class="text-center">
        <p class="text-sm font-semibold text-primary">Free restaurant tool</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
          Restaurant labour cost calculator
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-muted">
          Add sales, wages and employment costs to calculate total labour cost and labour percentage.
        </p>
      </header>

      <KitchenToolsRestaurantLabourCostCalculator />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'Restaurant Labour Cost Calculator — Misebox',
  description:
    'Calculate restaurant labour cost and labour percentage from sales, wages, employer costs and other labour costs.',
})
</script>
