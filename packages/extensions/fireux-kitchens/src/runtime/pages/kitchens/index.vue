<template>
  <main class="kitchens-page">
    <section class="kitchens-hero">
      <div class="kitchens-hero__copy">
        <p class="kitchens-hero__eyebrow">Kitchen directory</p>
        <h1>Discover great kitchens.</h1>
        <p class="kitchens-hero__lede">
          Browse kitchens using Misebox. Discover their menus, what they are
          serving, and the ways you can order.
        </p>

        <div class="kitchens-hero__actions">
          <UButton to="/" trailing-icon="i-lucide-arrow-right">
            Start your Kitchen
          </UButton>
          <span>One Kitchen and one published Menu are free.</span>
        </div>

        <ul class="kitchens-hero__benefits" aria-label="Directory benefits">
          <li>
            <UIcon name="i-lucide-chef-hat" />
            <span><strong>Kitchen profiles</strong>Identity you can trust</span>
          </li>
          <li>
            <UIcon name="i-lucide-clock-3" />
            <span><strong>Current menus</strong>Food and availability</span>
          </li>
          <li>
            <UIcon name="i-lucide-shield-check" />
            <span><strong>Clear fulfilment</strong>Know how to order</span>
          </li>
        </ul>
      </div>

      <div class="kitchens-hero__map" aria-hidden="true">
        <span class="kitchens-hero__road kitchens-hero__road--one" />
        <span class="kitchens-hero__road kitchens-hero__road--two" />
        <UIcon name="i-lucide-map-pin" class="kitchens-hero__pin kitchens-hero__pin--one" />
        <UIcon name="i-lucide-map-pin" class="kitchens-hero__pin kitchens-hero__pin--two" />
        <UIcon name="i-lucide-map-pin" class="kitchens-hero__pin kitchens-hero__pin--three" />
        <div class="kitchens-hero__map-card">
          <UIcon name="i-lucide-utensils" />
          <span><strong>Find your next kitchen</strong>Menus near you</span>
        </div>
      </div>
    </section>

    <KitchenCollectionManager />

    <section class="kitchens-page__teams">
      <KitchenCTA />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  tag: 'kitchens',
  nav: {
    key: 'kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'KitchensIndexPage',
  title: 'Kitchens',
  description:
    'Explore kitchens, discover their menus, and see what they are serving.',
})

const pageTitle = 'Kitchens'
const { appName } = useFireUXConfig()
useSeo({
  title: `${appName} | ${pageTitle}`,
  description:
    'Browse the Misebox Kitchen directory to discover restaurant profiles, current Menus and available ways to order.',
  path: '/kitchens',
})
</script>

<style scoped>
.kitchens-page {
  width: min(100% - 2rem, 90rem);
  margin-inline: auto;
  padding-block: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 20));
}

.kitchens-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(20rem, 0.85fr);
  gap: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 24));
  align-items: center;
  padding-bottom: clamp(calc(var(--spacing) * 10), 5vw, calc(var(--spacing) * 18));
}

.kitchens-hero__eyebrow {
  margin: 0 0 calc(var(--spacing) * 3);
  color: var(--ui-primary);
  font-size: 0.8rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.kitchens-hero h1 {
  max-width: 16ch;
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(2.65rem, 5vw, 4.75rem);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.kitchens-hero__lede {
  max-width: 39rem;
  margin: calc(var(--spacing) * 6) 0 0;
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-base), 1.4vw, var(--text-xl));
  line-height: 1.65;
}

.kitchens-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  margin-top: calc(var(--spacing) * 6);
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.kitchens-hero__benefits {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
  margin: calc(var(--spacing) * 8) 0 0;
  padding: 0;
  list-style: none;
}

.kitchens-hero__benefits li {
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  color: var(--ui-text-muted);
  font-size: 0.78rem;
}

.kitchens-hero__benefits svg {
  width: 2.6rem;
  height: 2.6rem;
  flex: 0 0 auto;
  padding: 0.65rem;
  border-radius: calc(var(--ui-radius) * 3);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, var(--ui-bg));
}

.kitchens-hero__benefits span,
.kitchens-hero__benefits strong {
  display: block;
}

.kitchens-hero__benefits strong {
  margin-bottom: 0.15rem;
  color: var(--ui-text-highlighted);
  font-size: 0.84rem;
}

.kitchens-hero__map {
  position: relative;
  min-height: 17rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-border) 70%, transparent);
  border-radius: calc(var(--ui-radius) * 6);
  background:
    linear-gradient(35deg, transparent 43%, color-mix(in srgb, var(--ui-bg) 80%, transparent) 44% 49%, transparent 50%),
    linear-gradient(125deg, transparent 38%, color-mix(in srgb, var(--ui-bg) 74%, transparent) 39% 44%, transparent 45%),
    color-mix(in srgb, var(--ui-bg-elevated) 80%, var(--ui-primary) 4%);
}

.kitchens-hero__pin {
  position: absolute;
  width: 2rem;
  height: 2rem;
  color: var(--ui-primary);
  filter: drop-shadow(0 0.35rem 0.4rem rgb(0 0 0 / 0.16));
}

.kitchens-hero__pin--one { top: 18%; left: 39%; }
.kitchens-hero__pin--two { top: 24%; right: 22%; }
.kitchens-hero__pin--three { bottom: 22%; left: 15%; }

.kitchens-hero__map-card {
  position: absolute;
  right: 12%;
  bottom: 22%;
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  min-width: 14rem;
  padding: calc(var(--spacing) * 3.5) calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-bg) 94%, transparent);
  box-shadow: 0 1rem 2rem rgb(15 23 42 / 0.14);
}

.kitchens-hero__map-card > svg { color: var(--ui-primary); }
.kitchens-hero__map-card span,
.kitchens-hero__map-card strong { display: block; }
.kitchens-hero__map-card span { color: var(--ui-text-muted); font-size: var(--text-xs); }
.kitchens-hero__map-card strong { margin-bottom: 0.15rem; color: var(--ui-text-highlighted); font-size: 0.88rem; }

.kitchens-page__teams { margin-top: clamp(calc(var(--spacing) * 16), 8vw, calc(var(--spacing) * 28)); }

@media (max-width: 900px) {
  .kitchens-hero { grid-template-columns: 1fr; }
  .kitchens-hero__map { min-height: 14rem; }
}

@media (max-width: 640px) {
  .kitchens-page { width: min(100% - 1.25rem, 90rem); padding-top: calc(var(--spacing) * 8); }
  .kitchens-hero__benefits { grid-template-columns: 1fr; }
  .kitchens-hero__map { display: none; }
}
</style>
