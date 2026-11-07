<template>
  <UContainer>
    <div class="pagebody">
      <header>
        <p class="fx-type-caption">Free restaurant tool</p>
        <h1 class="fx-type-page-title">Restaurant labour cost calculator</h1>
        <p class="fx-type-body">
          Add sales, wages and employment costs to calculate total labour cost
          and labour percentage. No sign-in is required.
        </p>
      </header>

      <KitchenToolsRestaurantLabourCostCalculator />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

useSeo({
  title: 'Restaurant Labour Cost Calculator — Misebox',
  description:
    'Calculate restaurant labour cost and labour percentage from sales, wages and employer costs for free, without signing in.',
  path: '/tools/restaurant-labour-cost',
})
</script>
