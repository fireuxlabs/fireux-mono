<template>
  <main class="yellow-velo-home">
    <section class="yv-hero">
      <img
        src="/img/yellow-velo/hero.png"
        alt="Yellow Velo bicycle showroom with cycling merchandise"
        class="yv-hero__image"
      >
      <div class="yv-hero__wash" />

      <UContainer class="yv-hero__inner">
        <div class="yv-hero__copy">
          <div>
            <UBadge color="neutral" variant="solid" class="yv-badge">
              Bikes, goods, and ride culture
            </UBadge>
            <h1>
              Yellow Velo
            </h1>
            <p class="yv-hero__lead">
              {{ instagramProfile.description }}
            </p>
          </div>

          <div class="yv-actions">
            <UButton to="/bikes" size="xl" color="neutral" icon="i-lucide-bike" class="yv-button yv-button--black">
              Explore bikes
            </UButton>
            <UButton to="/merch" size="xl" color="neutral" variant="outline" icon="i-lucide-shirt" class="yv-button yv-button--outline">
              Shop merch
            </UButton>
          </div>

          <dl class="yv-stats">
            <div
              v-for="stat in heroStats"
              :key="stat.label"
              class="yv-stat"
            >
              <dt>
                {{ stat.label }}
              </dt>
              <dd>
                {{ stat.value }}
              </dd>
            </div>
          </dl>
        </div>
      </UContainer>
    </section>

    <UContainer class="yv-sections">
      <section class="yv-categories" aria-label="Yellow Velo categories">
        <NuxtLink
          v-for="category in categories"
          :key="category.title"
          :to="category.href"
          class="yv-category-link"
        >
          <article class="yv-card">
            <div>
              <UIcon :name="category.icon" class="yv-card__icon" />
              <div>
                <h2>
                  {{ category.title }}
                </h2>
                <p>
                  {{ category.description }}
                </p>
              </div>
            </div>
          </article>
        </NuxtLink>
      </section>

      <section class="yv-range">
        <div class="yv-range__intro">
          <UBadge color="neutral" variant="solid" class="yv-badge">
            The range
          </UBadge>
          <h2>
            Built around the way people actually ride.
          </h2>
          <p>
            Yellow Velo starts with dependable bicycle families and surrounds
            them with the accessories, care items, and apparel riders come back
            for between bigger purchases.
          </p>
        </div>

        <div class="yv-range__grid">
          <div
            v-for="item in range"
            :key="item.title"
            class="yv-range-item"
          >
            <div>
              <UIcon :name="item.icon" />
              <div>
                <h3>
                  {{ item.title }}
                </h3>
                <p>
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="yv-drop">
        <div>
          <div>
            <h2>
              Drop-ready storefront scaffold
            </h2>
            <p>
              Products and stories are ready for bikes, kit, routes, and seasonal Yellow Velo drops.
            </p>
          </div>
          <UButton to="/products" color="neutral" size="xl" icon="i-lucide-shopping-bag" class="yv-button yv-button--black">
            Open products
          </UButton>
        </div>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Yellow Velo - Bicycles and cycling merchandise',
  ogTitle: 'Yellow Velo - Bicycles and cycling merchandise',
  twitterTitle: 'Yellow Velo - Bicycles and cycling merchandise',
  description: () => instagramProfile.description,
  ogDescription: () => instagramProfile.description,
  twitterDescription: () => instagramProfile.description,
})

const instagramProfile = {
  handle: '@yellow.velo.interlaken',
  url: 'https://www.instagram.com/yellow.velo.interlaken/',
  description:
    'Independent bike shop in Interlaken. Rentals & tours. Slingers of @sumocycleworks @erstwhile.brand @ultradynamico @swiftindustries @bombtrackbicycleco.',
}

const heroStats = [
  { label: 'Shop', value: 'Independent Interlaken' },
  { label: 'Ride', value: 'Rentals and tours' },
  { label: 'Goods', value: 'Selected brands' },
]

const categories = [
  {
    title: 'Bicycles',
    description: 'Balanced city builds, capable gravel rigs, and efficient road bikes.',
    icon: 'i-lucide-bike',
    href: '/bikes',
  },
  {
    title: 'Merchandise',
    description: 'Caps, shirts, bottles, bags, and simple ride-day goods.',
    icon: 'i-lucide-shirt',
    href: '/merch',
  },
  {
    title: 'Stories',
    description: 'Route notes, maintenance guides, launch drops, and rider features.',
    icon: 'i-lucide-newspaper',
    href: '/blog',
  },
]

const range = [
  {
    title: 'Commuter bikes',
    description: 'Durable frames, confident handling, and practical fixtures for daily use.',
    icon: 'i-lucide-building-2',
  },
  {
    title: 'Gravel bikes',
    description: 'Comfortable geometry and wide tire clearance for mixed-surface weekends.',
    icon: 'i-lucide-mountain',
  },
  {
    title: 'Road bikes',
    description: 'Light, fast builds for group rides, climbs, and long summer mornings.',
    icon: 'i-lucide-gauge',
  },
  {
    title: 'Merch drops',
    description: 'Small-batch apparel and accessories built around the Yellow Velo palette.',
    icon: 'i-lucide-sparkles',
  },
]
</script>

<style scoped>
.yellow-velo-home {
  overflow: clip;
  background: #eddb08;
  color: #050504;
}

.yv-hero {
  position: relative;
  min-height: 92svh;
  overflow: hidden;
  border-bottom: 5px solid #050504;
  background: #eddb08;
  isolation: isolate;
}

.yv-hero__image {
  position: absolute;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  mix-blend-mode: multiply;
  opacity: 0.58;
  filter: saturate(1.25) contrast(1.05);
}

.yv-hero__wash {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(90deg, #eddb08 0%, rgb(237 219 8 / 0.94) 42%, rgb(237 219 8 / 0.28) 72%, rgb(237 219 8 / 0.08) 100%),
    repeating-linear-gradient(-12deg, rgb(5 5 4 / 0.08) 0 2px, transparent 2px 18px);
}

.yv-hero__inner {
  min-height: 92svh;
  display: flex;
  align-items: center;
  padding-block: calc(var(--spacing) * 16);
}

.yv-hero__copy {
  max-width: 43rem;
}

.yv-hero__copy > div:first-child {
  display: grid;
  gap: calc(var(--spacing) * 5);
}

.yv-badge {
  width: fit-content;
  border: 2px solid #050504;
  background: #050504;
  color: #eddb08;
  text-transform: uppercase;
}

.yv-hero h1 {
  margin: 0;
  max-width: 9ch;
  color: #050504;
  font-size: 6.5rem;
  line-height: 0.84;
  font-weight: 950;
}

.yv-hero__lead {
  max-width: 37rem;
  margin: 0;
  color: #15140b;
  font-size: 1.22rem;
  line-height: 1.62;
  font-weight: 700;
}

.yv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: calc(var(--spacing) * 8);
}

.yv-button {
  border: 2px solid #050504;
  box-shadow: 5px 5px 0 #050504;
  font-weight: 900;
}

.yv-button--black {
  background: #050504;
  color: #eddb08;
}

.yv-button--outline {
  background: #eddb08;
  color: #050504;
}

.yv-stats {
  display: grid;
  max-width: 42rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  margin-top: calc(var(--spacing) * 8);
}

.yv-stat {
  min-height: 6.5rem;
  padding: calc(var(--spacing) * 4);
  border: 3px solid #050504;
  border-radius: calc(var(--ui-radius) * 2);
  background: #f6f2e6;
  box-shadow: 5px 5px 0 #050504;
}

.yv-stat dt {
  color: #4f4a10;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.yv-stat dd {
  margin: 0.35rem 0 0;
  color: #050504;
  font-size: 1rem;
  line-height: 1.15;
  font-weight: 950;
}

.yv-sections {
  display: grid;
  gap: calc(var(--spacing) * 16);
  padding-block: calc(var(--spacing) * 16);
}

.yv-categories {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}

.yv-category-link {
  display: block;
  height: 100%;
}

.yv-card,
.yv-range-item,
.yv-drop {
  border: 3px solid #050504;
  border-radius: calc(var(--ui-radius) * 2);
  background: #f6f2e6;
  box-shadow: 7px 7px 0 #050504;
}

.yv-card {
  height: 100%;
  min-height: 15rem;
  padding: 1.35rem;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.yv-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 10px 10px 0 #050504;
}

.yv-card > div {
  display: grid;
  gap: calc(var(--spacing) * 9);
}

.yv-card__icon {
  width: 2.25rem;
  height: 2.25rem;
  color: #050504;
}

.yv-card h2,
.yv-range h2,
.yv-drop h2 {
  margin: 0;
  color: #050504;
  font-weight: 950;
  line-height: 1;
}

.yv-card h2 {
  font-size: 1.55rem;
}

.yv-card p,
.yv-range p,
.yv-drop p {
  color: #26210a;
  line-height: 1.58;
  font-weight: 650;
}

.yv-card p {
  margin: 0.85rem 0 0;
  font-size: 0.98rem;
}

.yv-range {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: calc(var(--spacing) * 8);
  align-items: start;
}

.yv-range__intro {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.yv-range h2 {
  max-width: 11ch;
  font-size: 3.1rem;
}

.yv-range__intro p {
  max-width: 34rem;
  margin: 0;
}

.yv-range__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}

.yv-range-item {
  padding: 1.15rem;
}

.yv-range-item > div {
  display: flex;
  gap: 0.9rem;
}

.yv-range-item :deep(svg) {
  width: 1.4rem;
  height: 1.4rem;
  flex: 0 0 auto;
  color: #050504;
}

.yv-range-item h3 {
  margin: 0;
  color: #050504;
  font-weight: 950;
}

.yv-range-item p {
  margin: 0.4rem 0 0;
  font-size: 0.92rem;
}

.yv-drop {
  padding: calc(var(--spacing) * 6);
}

.yv-drop > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 6);
}

.yv-drop h2 {
  font-size: 2rem;
}

.yv-drop p {
  max-width: 42rem;
  margin: 0.7rem 0 0;
}

@media (max-width: 900px) {
  .yv-hero__wash {
    background:
      linear-gradient(180deg, rgb(237 219 8 / 0.62) 0%, #eddb08 61%),
      repeating-linear-gradient(-12deg, rgb(5 5 4 / 0.08) 0 2px, transparent 2px 18px);
  }

  .yv-hero__inner {
    align-items: end;
  }

  .yv-hero h1 {
    font-size: 4.6rem;
  }

  .yv-categories,
  .yv-range,
  .yv-range__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .yv-hero {
    min-height: auto;
  }

  .yv-hero__inner {
    min-height: 44rem;
  }

  .yv-hero h1 {
    font-size: 3.8rem;
  }

  .yv-actions,
  .yv-drop > div {
    flex-direction: column;
    align-items: stretch;
  }

  .yv-stats {
    grid-template-columns: 1fr;
  }
}
</style>
