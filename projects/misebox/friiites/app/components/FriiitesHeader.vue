<template>
  <header class="friiites-header" data-friiites-header>
    <div class="friiites-header__inner">
      <NuxtLink class="friiites-header__brand" to="/" aria-label="Friiites home">
        <AppBrandWordmark
          light-src="/img/app/wordmark-light.png"
          dark-src="/img/app/brand/wordmark-dark-transparent.png"
          alt="Friiites"
          size="medium"
          loading="eager"
        />
      </NuxtLink>

      <nav class="friiites-header__actions" aria-label="Primary navigation">
        <NuxtLink class="friiites-header__sign-in" to="/auth">
          Sign in
        </NuxtLink>

        <details class="friiites-header__menu">
          <summary aria-label="Open navigation menu">
            <UIcon name="i-lucide-menu" aria-hidden="true" />
          </summary>
          <nav aria-label="Secondary navigation">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.label"
              :to="item.to"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </details>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { templateOneOrderingCopy } from 'fireux-misebox/runtime/models/template-one'

const menuItems = [
  { label: 'Menu', to: '/#menu' },
  { label: templateOneOrderingCopy.navigationLabel, to: '/#order-now' },
  { label: 'Franchise', to: '/#franchise' },
  { label: 'Misebox', to: '/#misebox' },
] as const
</script>

<style scoped>
.friiites-header {
  z-index: 30;
  color: var(--ui-text-highlighted);
  background: var(--friiites-black);
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
}

.friiites-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 96rem);
  min-height: calc(var(--spacing) * 25);
  margin-inline: auto;
  padding: 0 clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
}

.friiites-header__brand {
  display: block;
  flex: 0 1 calc(var(--spacing) * 36);
  min-width: 0;
}

.friiites-header__brand :deep(.fx-brand-wordmark.fx-brand-wordmark) {
  display: block;
  width: 100%;
  max-width: none;
  height: auto;
}

.friiites-header__actions {
  display: flex;
  flex: 0 0 auto;
  gap: clamp(calc(var(--spacing) * 3), 2vw, calc(var(--spacing) * 7));
  align-items: center;
}

.friiites-header__sign-in,
.friiites-header__menu nav a {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.friiites-header__sign-in {
  color: color-mix(in srgb, currentColor 78%, transparent);
}

.friiites-header__menu summary {
  background-color: color-mix(in srgb, var(--friiites-black) 88%, transparent);
  background-image:
    linear-gradient(rgb(var(--brand-accent-rgb) / 7%), rgb(0 0 0 / 8%)),
    url('/img/template-one/charcoal-texture.webp');
  background-position: center;
  background-size: auto, 16rem;
  background-blend-mode: normal, soft-light;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 2%);
}

.friiites-header__menu {
  position: relative;
}

.friiites-header__menu summary {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  cursor: pointer;
  list-style: none;
  color: var(--friiites-gold);
  border: 1px solid currentColor;
  border-radius: 9999px;
  place-items: center;
}

.friiites-header__menu summary::-webkit-details-marker {
  display: none;
}

.friiites-header__menu summary :deep(svg) {
  width: 1.5rem;
  height: 1.5rem;
}

.friiites-header__menu summary:hover {
  background-color: color-mix(in srgb, var(--friiites-gold) 14%, var(--friiites-black));
}

.friiites-header__menu nav {
  position: absolute;
  top: calc(100% + 1rem);
  right: 0;
  display: grid;
  width: min(20rem, calc(100vw - 2rem));
  padding: calc(var(--spacing) * 3);
  color: var(--friiites-cream);
  background: color-mix(in srgb, var(--friiites-black) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--friiites-cream) 18%, transparent);
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 35%);
}

.friiites-header__menu nav a {
  padding: calc(var(--spacing) * 3.6) calc(var(--spacing) * 4);
  border-bottom: 1px solid color-mix(in srgb, var(--friiites-cream) 10%, transparent);
}

.friiites-header__menu nav a:last-child {
  border-bottom: 0;
}

.friiites-header__sign-in:hover,
.friiites-header__menu nav a:hover {
  color: var(--friiites-gold);
}

@media (max-width: 40rem) {
  .friiites-header__inner {
    min-height: 4.5rem;
    padding-inline: calc(var(--spacing) * 4);
  }

  .friiites-header__brand {
    flex-basis: clamp(7.5rem, 30vw, 10rem);
  }

  .friiites-header__actions {
    gap: 0.55rem;
  }

  .friiites-header__sign-in {
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
  }

}

@media (max-width: 23rem) {
  .friiites-header__brand {
    flex-basis: 6.75rem;
  }

  .friiites-header__actions {
    gap: 0.3rem;
  }

}
</style>
