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

<style scoped>
.holzworm {
  --holzworm-paper: #f5f0e7;
  --holzworm-paper-deep: #ede4d6;
  --holzworm-ink: #252018;
  --holzworm-muted: #665d51;
  --holzworm-line: #d9cbbb;
  --holzworm-copper: #a7522b;
  min-height: 100svh;
  overflow-x: clip;
  background: var(--holzworm-paper);
  color: var(--holzworm-ink);
}

.holzworm-masthead {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: clamp(35rem, 58vw, 47rem);
  border-bottom: 1px solid var(--holzworm-line);
  background: #d8c19d;
}

.holzworm-masthead__image {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.holzworm-masthead__inner {
  display: flex;
  min-height: inherit;
  align-items: flex-start;
  padding-block: clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 14));
}

.holzworm-masthead__copy {
  position: relative;
  isolation: isolate;
  display: grid;
  max-width: 24rem;
  gap: calc(var(--spacing) * 3.6);
  overflow: hidden;
  padding: clamp(calc(var(--spacing) * 4.6), 2.4vw, calc(var(--spacing) * 7));
  border: 1px solid rgb(37 32 24 / 16%);
  background: var(--holzworm-paper);
}

.holzworm-masthead__copy::before {
  position: absolute;
  right: -6rem;
  bottom: -6rem;
  z-index: 0;
  width: 17rem;
  aspect-ratio: 1;
  content: '';
  background: url('/img/app/holzworm/holzrosette-backdrop.jpg') 70% center / cover no-repeat;
  opacity: .1;
}

.holzworm-masthead__copy > * {
  position: relative;
  z-index: 1;
}

.holzworm-eyebrow,
.holzworm-product__category {
  margin: 0;
  color: var(--holzworm-copper);
  font-size: .72rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: .14em;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: var(--font-weight-medium);
  letter-spacing: -.045em;
  line-height: .98;
}

h1 { font-size: clamp(2.45rem, 4.7vw, 4.9rem); }
h2 { font-size: clamp(2.2rem, 4.5vw, var(--text-7xl)); }
h3 { font-size: clamp(1.45rem, 2.1vw, 2rem); }

.holzworm-masthead__copy > p:not(.holzworm-eyebrow) {
  margin: 0;
  color: var(--holzworm-muted);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.holzworm-masthead__copy :deep(a) { justify-self: start; }

.holzworm-catalogue { padding-block: clamp(calc(var(--spacing) * 12), 6vw, calc(var(--spacing) * 22)); }

.holzworm-request { padding-block: clamp(calc(var(--spacing) * 16), 8vw, calc(var(--spacing) * 32)); }

.holzworm-catalogue__heading {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(17rem, .65fr);
  gap: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 28));
  align-items: end;
}

.holzworm-catalogue__heading > p,
.holzworm-qr p,
.holzworm-request > div:last-child > p {
  margin: 0;
  color: var(--holzworm-muted);
  font-size: var(--text-base);
  line-height: 1.65;
}

.holzworm-catalogue__filters {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2.2);
  margin-top: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 14));
}

.holzworm-catalogue__filters :deep(button span) {
  margin-left: calc(var(--spacing) * 0.6);
  font-size: .75em;
  opacity: .68;
}

.holzworm-catalogue__result {
  display: flex;
  align-items: baseline;
  gap: calc(var(--spacing) * 2.8);
  margin: calc(var(--spacing) * 9) 0 calc(var(--spacing) * 4.6);
}

.holzworm-catalogue__result > p:last-child {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.35rem;
}

.holzworm-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(calc(var(--spacing) * 3.6), 2vw, calc(var(--spacing) * 5.4));
}

.holzworm-product { min-width: 0; }

.holzworm-product :deep(.rounded-lg) { border-radius: calc(var(--ui-radius) * 3); }

.holzworm-product :deep(.bg-default) { background: #fffaf4; }

.holzworm-product__media {
  overflow: hidden;
  aspect-ratio: 1 / 1;
  background: var(--holzworm-paper-deep);
}

.holzworm-product__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .35s ease;
}

.holzworm-product:hover .holzworm-product__media img { transform: scale(1.025); }

.holzworm-product__body {
  display: grid;
  gap: calc(var(--spacing) * 2.8);
  padding: clamp(calc(var(--spacing) * 3.6), 2vw, calc(var(--spacing) * 4.8));
}

.holzworm-product__title-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: calc(var(--spacing) * 3.4);
}

.holzworm-product__title-row strong {
  color: #71462f;
  padding-top: calc(var(--spacing) * 1);
  font-size: .82rem;
  text-align: right;
}

.holzworm-product__description {
  margin: calc(var(--spacing) * 3.6) 0 0;
  color: var(--holzworm-muted);
  font-size: .94rem;
  line-height: 1.55;
}

.holzworm-product__quick-data,
.holzworm-product details dl {
  display: grid;
  gap: calc(var(--spacing) * 3);
  margin: 0;
}

.holzworm-product__quick-data {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: calc(var(--spacing) * 3.6);
  padding-top: calc(var(--spacing) * 3.6);
  border-top: 1px solid var(--holzworm-line);
}

.holzworm-product__quick-data div,
.holzworm-product details dl div { display: grid; gap: calc(var(--spacing) * 0.72); }

.holzworm-product dt {
  color: #837566;
  font-size: .66rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.holzworm-product dd {
  margin: 0;
  color: #4d4439;
  font-size: .82rem;
  line-height: 1.45;
}

.holzworm-product details {
  padding-top: calc(var(--spacing) * 0.6);
}

.holzworm-product summary {
  cursor: pointer;
  color: #71462f;
  font-size: .86rem;
  font-weight: 750;
}

.holzworm-product details dl { margin-top: calc(var(--spacing) * 3.6); }

.holzworm-qr {
  border-block: 1px solid var(--holzworm-line);
  background: var(--holzworm-paper-deep);
}

.holzworm-qr__inner {
  display: grid;
  grid-template-columns: minmax(16rem, .76fr) minmax(0, .8fr);
  gap: clamp(calc(var(--spacing) * 8), 8vw, calc(var(--spacing) * 40));
  align-items: center;
  padding-block: clamp(calc(var(--spacing) * 14), 7vw, calc(var(--spacing) * 28));
}

.holzworm-qr__inner > img {
  width: 100%;
  border-radius: calc(var(--ui-radius) * 4);
  box-shadow: 0 1.5rem 3rem rgb(37 32 24 / 12%);
}

.holzworm-qr__inner > div {
  display: grid;
  justify-items: start;
  gap: calc(var(--spacing) * 5.4);
}

.holzworm-request {
  display: grid;
  grid-template-columns: minmax(0, .8fr) minmax(17rem, .7fr);
  gap: clamp(calc(var(--spacing) * 8), 9vw, calc(var(--spacing) * 44));
}

.holzworm-request > div:last-child { display: grid; gap: calc(var(--spacing) * 6); }

@media (max-width: 980px) {
  .holzworm-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .holzworm-catalogue__heading,
  .holzworm-qr__inner,
  .holzworm-request { grid-template-columns: 1fr; gap: calc(var(--spacing) * 8); }
  .holzworm-qr__inner > img { max-width: 34rem; }
}

@media (max-width: 620px) {
  .holzworm-masthead { min-height: 35rem; }
  .holzworm-masthead__image { object-position: 58% center; }
  .holzworm-masthead__copy { margin-top: calc(var(--spacing) * 2); }
  .holzworm-catalogue__filters { gap: calc(var(--spacing) * 1.8); }
  .holzworm-grid { grid-template-columns: 1fr; }
  .holzworm-product__title-row { gap: calc(var(--spacing) * 2.6); }
}
</style>
