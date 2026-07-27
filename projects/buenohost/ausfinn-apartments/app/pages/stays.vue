<template>
  <div>
    <AusfinnPageIntro
      eyebrow="The collection"
      title="Find your kind of alpine."
      description="From a one-bedroom studio to a five-bedroom historic villa, choose the space that fits the people you are bringing."
    />

    <section class="filter" aria-label="Filter stays">
      <button
        v-for="option in filters"
        :key="option"
        type="button"
        :class="{ active: filter === option }"
        @click="filter = option"
      >
        {{ option }}
      </button>
    </section>

    <section class="stays" aria-label="AUSFinn stays">
      <article v-for="stay in visibleStays" :id="stay.id" :key="stay.id">
        <div class="stay__image">
          <img :src="stay.image" :alt="stay.imageAlt" />
          <span>{{ stay.type }}</span>
        </div>
        <div class="stay__copy">
          <p>{{ stay.location }}</p>
          <h2>{{ stay.name }}</h2>
          <strong>{{ stay.summary }}</strong>
          <span>{{ stay.detail }}</span>
          <div class="stay__facts">
            <span
              ><UIcon name="i-lucide-bed-double" />{{
                stay.bedrooms
              }}
              bedrooms</span
            >
            <span
              ><UIcon name="i-lucide-bath" />{{
                stay.bathrooms
              }}
              bathrooms</span
            >
          </div>
          <NuxtLink :to="`/book?stay=${stay.id}`">Ask about this stay</NuxtLink>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ausfinnContent } from '../config/content.config'

definePageMeta({ layout: 'ausfinn-default' })

const filters = ['All', 'Apartment', 'House', 'Villa'] as const
const filter = ref<(typeof filters)[number]>('All')
const visibleStays = computed(() =>
  filter.value === 'All'
    ? ausfinnContent.stays
    : ausfinnContent.stays.filter((stay) => stay.type === filter.value)
)

useSeoMeta({
  title: 'Places to stay | AUSFinn Apartments',
  description:
    'Explore AUSFinn apartments, houses and the Alpine Guest House around Interlaken.',
})
</script>

<style scoped>
.filter {
  position: sticky;
  z-index: 10;
  top: 0;
  display: flex;
  justify-content: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--aus-line);
  background: rgb(247 243 233 / 92%);
  backdrop-filter: blur(16px);
}

.filter button {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 5);
  border: 1px solid var(--aus-line);
  border-radius: 9999px;
  background: transparent;
  color: var(--aus-muted);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-extrabold);
  cursor: pointer;
}

.filter button.active {
  border-color: var(--aus-forest);
  background: var(--aus-forest);
  color: var(--aus-white);
}

.stays {
  display: grid;
  gap: calc(var(--spacing) * 1);
}

.stays article {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(20rem, 0.75fr);
  min-height: 42rem;
  background: var(--aus-white);
  scroll-margin-top: calc(var(--spacing) * 20);
}

.stays article:nth-child(even) .stay__image {
  grid-column: 2;
}

.stays article:nth-child(even) .stay__copy {
  grid-column: 1;
  grid-row: 1;
  background: var(--aus-mist);
}

.stay__image {
  position: relative;
  min-height: 30rem;
  overflow: hidden;
}

.stay__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stay__image > span {
  position: absolute;
  top: calc(var(--spacing) * 5);
  left: calc(var(--spacing) * 5);
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  border-radius: 9999px;
  background: rgb(255 253 248 / 90%);
  color: var(--aus-ink);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
}

.stay__copy {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: calc(var(--spacing) * 5);
  padding: clamp(calc(var(--spacing) * 9), 6vw, calc(var(--spacing) * 20));
}

.stay__copy > p {
  margin: 0;
  color: var(--aus-coral);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.stay__copy h2 {
  max-width: 10ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2.75rem, 5vw, 5.5rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.06em;
  line-height: 0.92;
}

.stay__copy > strong {
  max-width: 32rem;
  font-size: 1.2rem;
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-normal);
}

.stay__copy > span {
  max-width: 32rem;
  color: var(--aus-muted);
  line-height: 1.7;
}

.stay__facts {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 4);
  padding-block: calc(var(--spacing) * 2);
}

.stay__facts span {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--aus-muted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.stay__copy a {
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 6);
  border-radius: 9999px;
  background: var(--aus-forest);
  color: var(--aus-white);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
}

@media (max-width: 50rem) {
  .filter {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .stays article {
    grid-template-columns: 1fr;
  }

  .stays article:nth-child(even) .stay__image,
  .stays article:nth-child(even) .stay__copy {
    grid-column: 1;
    grid-row: auto;
  }

  .stay__image {
    min-height: 23rem;
  }
}
</style>
