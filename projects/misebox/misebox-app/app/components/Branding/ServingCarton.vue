<template>
  <section class="grid gap-6">
    <header class="grid gap-2">
      <p class="fx-type-label m-0 text-primary">{{ product.role }}</p>
      <h2 class="m-0 text-3xl font-black text-highlighted">{{ product.name }}</h2>
      <p class="m-0 max-w-2xl text-muted">
        Start with the neutral Misebox product. Apply an App or Kitchen identity to the front panel.
      </p>
    </header>

    <div class="grid gap-4 lg:grid-cols-3">
      <UCard :ui="{ body: 'grid gap-4' }">
        <UBadge class="w-fit" color="neutral" variant="soft">Neutral · Misebox</UBadge>
        <img :src="product.neutralImage" alt="Neutral black serving carton" class="aspect-square w-full object-contain">
        <p class="m-0 text-sm text-muted">Branding surface: front panel · wordmark or mark</p>
      </UCard>

      <UCard v-for="treatment in product.treatments" :key="treatment.id" :ui="{ body: 'grid gap-4' }">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <UBadge color="primary" variant="soft">{{ treatment.owner.type }} brand</UBadge>
          <UBadge color="neutral" variant="subtle">{{ treatment.status }}</UBadge>
        </div>
        <img :src="treatment.image" :alt="`${treatment.owner.name} serving carton`" class="aspect-square w-full object-contain">
        <p class="m-0 font-semibold text-highlighted">{{ treatment.owner.name }}</p>
      </UCard>
    </div>

    <div class="flex flex-wrap gap-2">
      <UBadge color="neutral" variant="soft">Minimum {{ product.commerce.minimumQuantity }}</UBadge>
      <UBadge color="neutral" variant="soft">Order in {{ product.commerce.orderIncrement }}s</UBadge>
      <UBadge color="neutral" variant="soft">Unit: {{ product.commerce.unit }}</UBadge>
    </div>
  </section>
</template>

<script setup lang="ts">
import { servingCartonProduct } from '@/content/brandable-products'

const product = servingCartonProduct
</script>
