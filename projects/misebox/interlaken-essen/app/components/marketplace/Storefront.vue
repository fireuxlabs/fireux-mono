<template>
  <article class="market-storefront__content">
    <NuxtLink to="/marktplatz" class="market-storefront__back">
      <UIcon name="i-lucide-arrow-left" aria-hidden="true" />
      {{ copy('storefront_back_to_marketplace') }}
    </NuxtLink>

    <section class="market-storefront__hero">
      <div class="market-storefront__intro">
        <p class="market-eyebrow">{{ copy('storefront_preview_label') }}</p>
        <h1 id="storefront-title">{{ copy(seller.nameKey) }}</h1>

        <div class="market-storefront__facts">
          <span>
            <UIcon name="i-lucide-map-pin" aria-hidden="true" />
            {{ seller.place }}
          </span>
          <span>
            <UIcon name="i-lucide-badge-check" aria-hidden="true" />
            {{ copy('storefront_goldseal') }}
          </span>
        </div>

        <p class="market-storefront__description">
          {{ copy(seller.descriptionKey) }}
        </p>

        <p class="market-storefront__prototype-note">
          <UIcon name="i-lucide-pencil-ruler" aria-hidden="true" />
          {{ copy('storefront_prototype_note') }}
        </p>
      </div>

      <MarketplaceHoneyArtwork
        :alt="copy(seller.imageAltKey)"
        large
      />
    </section>

    <section class="market-storefront__offers" aria-labelledby="offer-title">
      <header>
        <div>
          <p class="market-eyebrow">{{ copy('storefront_offer_eyebrow') }}</p>
          <h2 id="offer-title">{{ copy('storefront_offer_title') }}</h2>
        </div>
        <p>{{ copy('storefront_offer_intro') }}</p>
      </header>

      <div class="market-storefront__offer-grid">
        <article
          v-for="offer in seller.offers"
          :key="offer.id"
          class="market-storefront__offer"
          :class="{ 'is-selected': selectedOffer?.id === offer.id }"
        >
          <span class="market-storefront__offer-size">{{ offer.weight }}</span>
          <h3>{{ copy(offer.labelKey) }}</h3>
          <dl>
            <div>
              <dt>{{ copy('storefront_price_label') }}</dt>
              <dd>{{ copy('storefront_price_pending') }}</dd>
            </div>
            <div>
              <dt>{{ copy('storefront_availability_label') }}</dt>
              <dd>{{ copy('storefront_availability_pending') }}</dd>
            </div>
          </dl>
          <button type="button" @click="selectOffer(offer)">
            <UIcon name="i-lucide-circle-check" aria-hidden="true" />
            {{ copy('storefront_choose_size') }}
          </button>
        </article>
      </div>
    </section>

    <section
      v-if="selectedOffer"
      class="market-storefront__interest"
      aria-live="polite"
    >
      <div>
        <p class="market-eyebrow">{{ copy('storefront_interest_eyebrow') }}</p>
        <h2 v-if="!interestPreviewed">
          {{
            copy('storefront_interest_title', {
              weight: selectedOffer.weight,
            })
          }}
        </h2>
        <h2 v-else>{{ copy('storefront_interest_complete_title') }}</h2>
        <p v-if="!interestPreviewed">
          {{ copy('storefront_interest_body') }}
        </p>
        <p v-else>{{ copy('storefront_interest_complete_body') }}</p>
      </div>

      <button
        v-if="!interestPreviewed"
        type="button"
        class="market-action market-action--dark"
        @click="interestPreviewed = true"
      >
        <UIcon name="i-lucide-heart-handshake" aria-hidden="true" />
        <strong>{{ copy('storefront_preview_interest') }}</strong>
        <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
      </button>
      <NuxtLink
        v-else
        to="/choufe/honig"
        class="market-action market-action--dark"
      >
        <UIcon name="i-lucide-hexagon" aria-hidden="true" />
        <strong>{{ copy('storefront_back_to_honey') }}</strong>
        <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
      </NuxtLink>

      <small>{{ copy('storefront_no_order_note') }}</small>
    </section>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import type {
  MarketplacePreviewOffer,
  MarketplacePreviewSeller,
} from '@/content/marketplace-preview'

defineProps<{
  seller: MarketplacePreviewSeller
}>()

const { copy } = useInterlakenCopy()
const selectedOffer = ref<MarketplacePreviewOffer>()
const interestPreviewed = ref(false)

function selectOffer(offer: MarketplacePreviewOffer) {
  selectedOffer.value = offer
  interestPreviewed.value = false
}
</script>
