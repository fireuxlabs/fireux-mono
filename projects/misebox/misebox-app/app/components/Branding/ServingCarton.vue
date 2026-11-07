<template>
  <section class="pagebody">
    <header class="pagebody">
      <p class="fx-type-label">{{ product.role }}</p>
      <h2 class="fx-type-section-title">{{ product.name }}</h2>
      <p class="fx-type-body">
        Start with the neutral Misebox product. Apply an App or Kitchen identity
        to the front panel.
      </p>
    </header>

    <UPageGrid>
      <UCard>
        <UBadge color="neutral" variant="soft">Neutral · Misebox</UBadge>
        <img :src="product.neutralImage" alt="Neutral black serving carton" />
        <p class="fx-type-caption">
          Branding surface: front panel · wordmark or mark
        </p>
      </UCard>

      <UCard v-for="treatment in product.treatments" :key="treatment.id">
        <div class="card__header">
          <UBadge color="primary" variant="soft"
            >{{ treatment.owner.type }} brand</UBadge
          >
          <UBadge color="neutral" variant="subtle">{{
            treatment.status
          }}</UBadge>
        </div>
        <img
          :src="treatment.image"
          :alt="`${treatment.owner.name} serving carton`"
        />
        <p class="fx-type-body">{{ treatment.owner.name }}</p>
      </UCard>
    </UPageGrid>

    <div>
      <UBadge color="neutral" variant="soft"
        >Minimum {{ product.commerce.minimumQuantity }}</UBadge
      >
      <UBadge color="neutral" variant="soft"
        >Order in {{ product.commerce.orderIncrement }}s</UBadge
      >
      <UBadge color="neutral" variant="soft"
        >Unit: {{ product.commerce.unit }}</UBadge
      >
    </div>
  </section>
</template>

<script setup lang="ts">
import { servingCartonProduct } from '@/content/brandable-products'

const product = servingCartonProduct
</script>
