<template>
  <UPage class="kitchens-index">
    <header class="kitchens-index__hero">
      <div class="kitchens-index__hero-copy">
        <p class="kitchens-index__eyebrow">Discover</p>
        <h1>{{ pageTitle }}</h1>
        <p>
          Explore kitchens, discover their menus, and find what they are
          serving.
        </p>
      </div>

      <div class="kitchens-index__hero-mark" aria-hidden="true">
        <UIcon name="i-lucide-chef-hat" />
      </div>
    </header>

    <UPageBody class="kitchens-index__body">
      <KitchenCollectionManager />

      <!-- Console CTA family remains the secondary operator doorway. -->
      <section class="kitchens-index__operator">
        <p class="kitchens-index__operator-eyebrow">For kitchen teams</p>
        <KitchenCTA />
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

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
  description: 'Explore kitchens, discover their menus, and see what they are serving.',
})

const pageTitle = 'Kitchens'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>

<style scoped>
.kitchens-index__hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: clamp(1.5rem, 4vw, 4rem);
  overflow: hidden;
  min-height: clamp(17rem, 38vw, 25rem);
  padding: clamp(2rem, 6vw, 5rem);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  background:
    radial-gradient(
      circle at 85% 18%,
      color-mix(in srgb, var(--ui-primary) 22%, transparent),
      transparent 34%
    ),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg)) 0%,
      var(--ui-bg) 68%
    );
}

.kitchens-index__hero::after {
  position: absolute;
  right: -5rem;
  bottom: -8rem;
  width: 22rem;
  height: 22rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-radius: 9999px;
  content: '';
}

.kitchens-index__hero-copy {
  position: relative;
  z-index: 1;
  max-width: 43rem;
}

.kitchens-index__eyebrow,
.kitchens-index__operator-eyebrow {
  margin: 0 0 0.75rem;
  color: var(--ui-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.kitchens-index__hero h1 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(3rem, 9vw, 6.5rem);
  font-weight: 700;
  letter-spacing: -0.06em;
  line-height: 0.9;
}

.kitchens-index__hero-copy > p:last-child {
  max-width: 36rem;
  margin: clamp(1.25rem, 3vw, 2rem) 0 0;
  color: var(--ui-text-muted);
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.65;
}

.kitchens-index__hero-mark {
  position: relative;
  z-index: 1;
  display: grid;
  width: clamp(4.5rem, 11vw, 7rem);
  height: clamp(4.5rem, 11vw, 7rem);
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 22%, var(--ui-border));
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-bg) 80%, transparent);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  color: var(--ui-primary);
  font-size: clamp(2rem, 5vw, 3.25rem);
  backdrop-filter: blur(12px);
}

.kitchens-index__body {
  display: grid;
  gap: clamp(3.5rem, 8vw, 7rem);
  padding-top: clamp(3rem, 7vw, 5.5rem);
  padding-bottom: clamp(3rem, 7vw, 5.5rem);
}

.kitchens-index__operator {
  display: grid;
  gap: 0.75rem;
  padding-top: clamp(2rem, 4vw, 3rem);
  border-top: 1px solid var(--ui-border);
}

.kitchens-index__operator-eyebrow {
  margin-bottom: 0;
}

@media (max-width: 640px) {
  .kitchens-index__hero {
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    min-height: 24rem;
  }

  .kitchens-index__hero-mark {
    justify-self: end;
  }
}
</style>
