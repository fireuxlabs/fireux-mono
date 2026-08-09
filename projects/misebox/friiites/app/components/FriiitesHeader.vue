<template>
  <header class="friiites-header" data-friiites-header>
    <div class="friiites-header__inner">
      <NuxtLink class="friiites-header__brand" to="/" aria-label="Friiites home">
        <img
          src="/img/app/wordmark-dark.png"
          alt="Friiites"
          width="1600"
          height="500"
        />
      </NuxtLink>

      <nav class="friiites-header__actions" aria-label="Primary navigation">
        <NuxtLink class="friiites-header__sign-in" to="/auth">
          Sign in
        </NuxtLink>

        <NuxtLink class="friiites-header__order" to="/#ordering">
          <span class="friiites-header__order-desktop">Order now</span>
          <span class="friiites-header__order-mobile">Order</span>
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
const menuItems = [
  { label: 'Our method', to: '/#method' },
  { label: 'The product', to: '/#product' },
  { label: 'Ordering', to: '/#ordering' },
  { label: 'Order journey', to: '/#journey' },
  { label: 'Franchise', to: '/#system' },
  { label: 'Locations', to: '/#locations' },
] as const
</script>

<style scoped>
.friiites-header {
  position: absolute;
  inset: 0 0 auto;
  z-index: 30;
  color: var(--friiites-cream);
  background: transparent;
  border-bottom: 1px solid color-mix(in srgb, var(--friiites-cream) 18%, transparent);
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

.friiites-header__brand img {
  display: block;
  width: 100%;
  height: auto;
}

.friiites-header__actions {
  display: flex;
  flex: 0 0 auto;
  gap: clamp(calc(var(--spacing) * 3), 2vw, calc(var(--spacing) * 7));
  align-items: center;
}

.friiites-header__sign-in,
.friiites-header__order,
.friiites-header__menu nav a {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.friiites-header__sign-in {
  color: color-mix(in srgb, var(--friiites-cream) 78%, transparent);
}

.friiites-header__order {
  padding: calc(var(--spacing) * 3.4) calc(var(--spacing) * 5);
  color: var(--friiites-black);
  background: var(--friiites-gold);
}

.friiites-header__order-mobile {
  display: none;
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
  place-items: center;
}

.friiites-header__menu summary::-webkit-details-marker {
  display: none;
}

.friiites-header__menu summary :deep(svg) {
  width: 1.5rem;
  height: 1.5rem;
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

  .friiites-header__order {
    padding: 0.7rem 0.85rem;
  }

  .friiites-header__order-desktop {
    display: none;
  }

  .friiites-header__order-mobile {
    display: inline;
  }
}

@media (max-width: 23rem) {
  .friiites-header__brand {
    flex-basis: 6.75rem;
  }

  .friiites-header__actions {
    gap: 0.3rem;
  }

  .friiites-header__order {
    padding-inline: 0.65rem;
  }
}
</style>
