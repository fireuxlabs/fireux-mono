<template>
  <main class="holzworm">
    <section class="holzworm-masthead" aria-labelledby="holzworm-title">
      <img
        class="holzworm-masthead__image"
        src="/img/app/holzworm/holzworm-atelier-hero.jpg"
        alt="Originale Holzworm-Produktentwürfe aus Holz: Bärenanhänger, Aare-Linienbild, Untersetzer, Tischaufsteller und Holzkarten"
        fetchpriority="high"
      >
      <UContainer class="holzworm-masthead__inner">
        <div class="holzworm-masthead__copy">
          <p class="holzworm-eyebrow">Holzworm · Bern</p>
          <h1 id="holzworm-title">Lasergravur auf Holz.</h1>
          <p>20 Entwürfe, Einzelstücke und Kleinserien.</p>
          <UButton to="#katalog" size="lg" color="primary">Katalog öffnen</UButton>
        </div>
      </UContainer>
    </section>

    <section id="katalog" aria-labelledby="catalogue-title">
      <UContainer class="holzworm-catalogue">
        <header class="holzworm-catalogue__heading">
          <div>
            <p class="holzworm-eyebrow">Produktkatalog</p>
            <h2 id="catalogue-title">20 Produktentwürfe aus Holz.</h2>
          </div>
          <p>Preis, Material und Produktionszeit werden vor dem Auftrag bestätigt.</p>
        </header>

        <nav class="holzworm-catalogue__filters" aria-label="Holzworm Kategorien">
          <UButton
            :color="activeCategory === 'Alle' ? 'primary' : 'neutral'"
            :variant="activeCategory === 'Alle' ? 'solid' : 'soft'"
            size="lg"
            :aria-pressed="activeCategory === 'Alle'"
            aria-controls="holzworm-product-grid"
            @click="activeCategory = 'Alle'"
          >
            Alle <span>{{ holzwormProducts.length }}</span>
          </UButton>
          <UButton
            v-for="category in categoriesWithCount"
            :key="category.name"
            :color="activeCategory === category.name ? 'primary' : 'neutral'"
            :variant="activeCategory === category.name ? 'solid' : 'soft'"
            size="lg"
            :aria-pressed="activeCategory === category.name"
            aria-controls="holzworm-product-grid"
            @click="activeCategory = category.name"
          >
            {{ category.name }} <span>{{ category.count }}</span>
          </UButton>
        </nav>

        <div class="holzworm-catalogue__result" aria-live="polite">
          <p class="holzworm-eyebrow">{{ activeCategory }}</p>
          <p>{{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'Produkt' : 'Produkte' }}</p>
        </div>

        <section id="holzworm-product-grid" class="holzworm-grid" aria-label="Holzworm Produkte">
          <article v-for="product in filteredProducts" :key="product.slug" class="holzworm-product">
            <UCard :ui="{ body: 'p-0 sm:p-0' }">
              <div class="holzworm-product__media">
                <img :src="product.image.src" :alt="product.image.alt" loading="lazy">
              </div>
              <div class="holzworm-product__body">
                <p class="holzworm-product__category">{{ product.category }}</p>
                <div class="holzworm-product__title-row">
                  <h3>{{ product.name }}</h3>
                  <strong>{{ product.price }}</strong>
                </div>
                <details>
                  <summary>Material, Format &amp; Anfrage</summary>
                  <p class="holzworm-product__description">{{ product.description }}</p>
                  <dl class="holzworm-product__quick-data">
                    <div><dt>Holz</dt><dd>{{ product.material }}</dd></div>
                    <div><dt>Format</dt><dd>{{ product.variants }}</dd></div>
                  </dl>
                  <dl>
                    <div><dt>Personalisierung</dt><dd>{{ product.customisation }}</dd></div>
                    <div><dt>Fertigung</dt><dd>{{ product.fulfilment }}</dd></div>
                  </dl>
                </details>
              </div>
            </UCard>
          </article>
        </section>
      </UContainer>
    </section>

    <section id="restaurant-qr" class="holzworm-qr" aria-labelledby="qr-title">
      <UContainer class="holzworm-qr__inner">
        <img
          src="/img/app/holzworm/products/menue-qr-plakette.jpg"
          alt="Originaler Holzworm-Produktentwurf einer hellen Menü-QR-Plakette mit leerem QR-Feld"
          loading="lazy"
        >
        <div>
          <p class="holzworm-eyebrow">Restaurant-QR</p>
          <h2 id="qr-title">Vier Formate für QR-Codes.</h2>
          <p>
            Aufsteller, Plaketten, Reserviert-Blöcke und Kartenklemmen. QR-Code und
            Zieladresse kommen vom Restaurant.
          </p>
          <UButton
            to="#katalog"
            color="neutral"
            variant="soft"
            @click="activeCategory = 'Restaurant-QR'"
          >
            Restaurant-QR ansehen
          </UButton>
        </div>
      </UContainer>
    </section>

    <section id="anfrage" aria-labelledby="request-title">
      <UContainer class="holzworm-request">
        <div>
          <p class="holzworm-eyebrow">Sonderanfertigung</p>
          <h2 id="request-title">Produkt anfragen.</h2>
        </div>
        <div>
          <p>
            Für eine Anfrage: Produkt, Stückzahl, Holz, Mass und Termin. Für Logo,
            Foto oder QR bitte eine freigegebene Vorlage senden.
          </p>
          <UAlert
            color="warning"
            variant="soft"
            title="Noch nicht bestellbar"
            description="Kontaktweg, Bestellablauf, Zahlung, Lagerbestand und Lieferzeit werden vor dem Start veröffentlicht."
          />
        </div>
      </UContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  holzwormCategories,
  holzwormProducts,
  type HolzwormCategory,
} from '../config/holzworm-catalogue'

definePageMeta({
  layout: 'landing',
  nav: { key: 'home', label: 'Start', icon: 'i-lucide-home', desktop: true, mobile: true, layouts: ['landing'] },
})

const activeCategory = ref<HolzwormCategory | 'Alle'>('Alle')

const categoriesWithCount = computed(() =>
  holzwormCategories.map(category => ({
    ...category,
    count: holzwormProducts.filter(product => product.category === category.name).length,
  }))
)

const filteredProducts = computed(() =>
  activeCategory.value === 'Alle'
    ? holzwormProducts
    : holzwormProducts.filter(product => product.category === activeCategory.value)
)

useSeoMeta({
  title: 'Holzworm | Lasergravur aus Holz in Bern',
  description: 'Holzworm: 20 Produktentwürfe für Lasergravur aus Holz in Bern.',
  ogImage: '/img/app/holzworm/holzworm-atelier-hero.jpg',
})
</script>

<style scoped src="./holzworm-home.css"></style>
