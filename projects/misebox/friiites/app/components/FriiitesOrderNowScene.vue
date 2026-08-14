<template>
  <section id="order-now" class="friiites-lower-section friiites-order" data-landing-scene="order-your-way">
    <header class="friiites-order__header">
      <div>
        <p class="friiites-order__eyebrow">Five ways to order</p>
        <h2>Order your way</h2>
      </div>
      <p>Choose the service that fits where you are and how you want your fries.</p>
    </header>

    <div class="friiites-order__artifacts" aria-label="Friiites ordering equipment">
      <img src="/img/app/branding/table-qr-stand.png" alt="Friiites table QR ordering stand" loading="lazy">
      <img src="/img/app/packaging/carton-empty.webp" alt="Friiites serving carton" loading="lazy">
      <img src="/img/app/branding/takeaway-bag.png" alt="Friiites takeaway bag" loading="lazy">
    </div>

    <div class="friiites-order__grid">
      <NuxtLink
        v-for="(surface, index) in surfaces"
        :key="surface.label"
        class="friiites-order__card"
        :class="`friiites-order__card--${surface.context}`"
        :to="surface.to"
      >
        <span class="friiites-order__number">0{{ index + 1 }}</span>
        <UIcon :name="surface.icon" aria-hidden="true" />
        <div>
          <h3>{{ surface.label }}</h3>
          <p>{{ surface.description }}</p>
        </div>
        <span class="friiites-order__action">
          {{ surface.action }}
          <span aria-hidden="true">→</span>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const surfaces = [
  {
    label: 'Table', context: 'table', icon: 'i-lucide-utensils',
    description: 'Scan at your table. We bring the fries to you.',
    action: 'Table menu', to: '/friiites.table',
  },
  {
    label: 'Kiosk', context: 'kiosk', icon: 'i-lucide-monitor',
    description: 'Build your order on the in-store touch screen.',
    action: 'Kiosk menu', to: '/friiites.kiosk',
  },
  {
    label: 'Delivery', context: 'delivery', icon: 'i-lucide-bike',
    description: 'Choose your fries and send them to your door.',
    action: 'Delivery menu', to: '/friiites.delivery',
  },
  {
    label: 'Collection', context: 'collection', icon: 'i-lucide-shopping-bag',
    description: 'Order ahead and collect when your fries are ready.',
    action: 'Collection menu', to: '/friiites.collection',
  },
  {
    label: 'Counter', context: 'counter', icon: 'i-lucide-chef-hat',
    description: 'Order with the Friiites team at the counter.',
    action: 'Staff sign in', to: '/auth?redirect=/friiites.staff_pos',
  },
] as const
</script>

<style scoped>
.friiites-order { gap: clamp(calc(var(--spacing) * 10), 7vw, calc(var(--spacing) * 20)); }
.friiites-order__header { display: grid; grid-template-columns: minmax(16rem, 1fr) minmax(15rem, 0.65fr); gap: calc(var(--spacing) * 10); align-items: end; }
.friiites-order__header > p { margin: 0; }
.friiites-order__artifacts { display: grid; grid-template-columns: 0.8fr 1.5fr 0.9fr; align-items: end; width: min(100%, 68rem); margin-inline: auto; }
.friiites-order__artifacts img { width: 100%; max-height: 20rem; object-fit: contain; filter: drop-shadow(0 calc(var(--spacing) * 5) calc(var(--spacing) * 4) rgb(0 0 0 / 55%)); }
.friiites-order__artifacts img:nth-child(2) { z-index: 1; width: 115%; margin-left: -8%; }
.friiites-order__eyebrow { margin: 0 0 calc(var(--spacing) * 4) !important; color: var(--friiites-gold) !important; font-size: var(--text-xs) !important; font-weight: var(--font-weight-extrabold); letter-spacing: var(--tracking-widest); text-transform: uppercase; }
.friiites-order__grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border: 1px solid color-mix(in srgb, var(--friiites-gold) 52%, transparent); }
.friiites-order__card { position: relative; display: grid; grid-template-rows: auto auto 1fr auto; gap: calc(var(--spacing) * 6); min-height: 23rem; padding: calc(var(--spacing) * 6); overflow: hidden; color: var(--friiites-cream); background: rgb(0 0 0 / 18%); border-right: 1px solid color-mix(in srgb, var(--friiites-gold) 38%, transparent); }
.friiites-order__card:last-child { border-right: 0; }
.friiites-order__card::after { position: absolute; right: -35%; bottom: -38%; width: 12rem; height: 12rem; content: ''; background: radial-gradient(circle, color-mix(in srgb, var(--friiites-gold) 20%, transparent), transparent 68%); transition: transform 180ms ease; }
.friiites-order__card:hover { color: var(--friiites-cream); background: color-mix(in srgb, var(--friiites-gold) 10%, transparent); }
.friiites-order__card:hover::after { transform: translate(-15%, -15%) scale(1.2); }
.friiites-order__number { color: color-mix(in srgb, var(--friiites-gold) 68%, transparent); font-size: var(--text-xs); font-weight: var(--font-weight-extrabold); letter-spacing: var(--tracking-widest); }
.friiites-order__card > :deep(svg) { width: calc(var(--spacing) * 12); height: calc(var(--spacing) * 12); color: var(--friiites-gold); stroke-width: 1.35; }
.friiites-order__card h3 { margin: 0; font-size: clamp(var(--text-xl), 2.4vw, var(--text-3xl)); line-height: 0.9; text-transform: uppercase; }
.friiites-order__card p { margin-top: calc(var(--spacing) * 3); font-size: var(--text-sm); }
.friiites-order__action { z-index: 1; display: flex; gap: calc(var(--spacing) * 3); align-items: center; justify-content: space-between; padding-top: calc(var(--spacing) * 4); color: var(--friiites-gold); border-top: 1px solid color-mix(in srgb, var(--friiites-gold) 38%, transparent); font-size: var(--text-xs); font-weight: var(--font-weight-extrabold); letter-spacing: var(--tracking-wide); text-transform: uppercase; }

@media (max-width: 64rem) {
  .friiites-order__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .friiites-order__card { grid-column: span 2; min-height: 19rem; }
  .friiites-order__card:nth-child(4) { grid-column: 2 / span 2; }
  .friiites-order__card:nth-child(5) { grid-column: 4 / span 2; }
  .friiites-order__card:nth-child(3), .friiites-order__card:nth-child(5) { border-right: 0; }
  .friiites-order__card:nth-child(-n + 3) { border-bottom: 1px solid color-mix(in srgb, var(--friiites-gold) 38%, transparent); }
}

@media (max-width: 42rem) {
  .friiites-order__header { grid-template-columns: 1fr; gap: calc(var(--spacing) * 5); }
  .friiites-order__grid { grid-template-columns: 1fr 1fr; }
  .friiites-order__artifacts { width: 125%; max-width: none; margin-left: -12.5%; }
  .friiites-order__card, .friiites-order__card:nth-child(4), .friiites-order__card:nth-child(5) { grid-column: auto; min-height: 16.5rem; padding: calc(var(--spacing) * 5); border-right: 1px solid color-mix(in srgb, var(--friiites-gold) 38%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--friiites-gold) 38%, transparent); }
  .friiites-order__card:nth-child(even) { border-right: 0; }
  .friiites-order__card:last-child { grid-column: 1 / -1; grid-template-columns: auto auto 1fr; grid-template-rows: auto auto; align-items: center; min-height: 10rem; border-right: 0; border-bottom: 0; }
  .friiites-order__card:last-child .friiites-order__action { grid-column: 1 / -1; }
  .friiites-order__card h3 { font-size: var(--text-2xl); }
  .friiites-order__card p { font-size: var(--text-xs); }
}
</style>
