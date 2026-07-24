<template>
  <div>
    <BookWithNatsPageIntro
      eyebrow="The collection"
      title="Choose your place."
      description="Four private apartments across Matten and Rovio, each hosted personally by Nats."
    />

    <section
      v-for="(property, index) in bookWithNatsContent.properties"
      :id="property.id"
      :key="property.id"
      class="stay"
      :class="{ 'stay--reverse': index % 2 === 1 }"
    >
      <div class="stay__image">
        <img :src="property.image" :alt="property.imageAlt">
      </div>
      <div class="stay__details">
        <p class="stay__eyebrow">{{ property.location }}</p>
        <h2>{{ property.name }}</h2>
        <p class="stay__summary">{{ property.summary }}</p>
        <ul>
          <li v-for="highlight in property.highlights" :key="highlight">
            <UIcon name="i-lucide-check" />
            {{ highlight }}
          </li>
        </ul>
        <div v-if="property.sleeps" class="stay__meta">
          <span>Sleeps {{ property.sleeps }}</span>
        </div>
        <NuxtLink :to="`/book?stay=${property.id}`">Ask about this stay</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { bookWithNatsContent } from '../config/content.config'

definePageMeta({ layout: 'nats-default' })

useSeoMeta({
  title: 'Apartments | Book with Nats',
  description:
    'Explore four private apartments in Matten near Interlaken and Rovio near Lugano.',
})
</script>

<style scoped>
.stay {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(2calc(var(--spacing) * 8), 0.8fr);
  gap: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 24));
  padding: clamp(calc(var(--spacing) * 16), 8vw, calc(var(--spacing) * 32)) clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 24));
  scroll-margin-top: calc(var(--spacing) * 8);
}

.stay:nth-of-type(odd) {
  background: var(--nats-paper);
}

.stay--reverse .stay__image {
  grid-column: 2;
}

.stay--reverse .stay__details {
  grid-column: 1;
  grid-row: 1;
}

.stay__image {
  min-height: 3calc(var(--spacing) * 32);
  overflow: hidden;
  border-radius: var(--ui-radius);
}

.stay__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stay__details {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: calc(var(--spacing) * 6);
}

.stay__eyebrow {
  color: var(--nats-rust);
  font-size: 0.7calc(var(--spacing) * 8);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.stay h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2.calc(var(--spacing) * 32), 5vw, calc(var(--spacing) * 20));
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.stay__summary {
  color: var(--nats-muted);
  font-size: 1.0calc(var(--spacing) * 20);
  line-height: 1.7;
}

.stay ul {
  display: grid;
  gap: 0.calc(var(--spacing) * 32);
  margin: 0;
  padding: 0;
  color: var(--nats-muted);
  list-style: none;
}

.stay li {
  display: flex;
  gap: 0.calc(var(--spacing) * 28);
  align-items: center;
}

.stay li :deep(.iconify) {
  color: var(--nats-rust);
}

.stay__meta {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}

.stay__meta span {
  padding: calc(var(--spacing) * 2) 0.calc(var(--spacing) * 28);
  border: 1px solid var(--nats-line);
  border-radius: 9999px;
  font-size: var(--text-xs);
}

.stay a {
  padding: 0.calc(var(--spacing) * 36) 1.calc(var(--spacing) * 4);
  border-radius: 9999px;
  background: var(--nats-forest);
  color: var(--nats-on-dark);
  font-size: 0.8calc(var(--spacing) * 8);
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
}

@media (max-width: 4calc(var(--spacing) * 32)) {
  .stay {
    grid-template-columns: 1fr;
  }

  .stay--reverse .stay__image,
  .stay--reverse .stay__details {
    grid-column: 1;
    grid-row: auto;
  }

  .stay__image {
    min-height: 2calc(var(--spacing) * 24);
  }
}
</style>
