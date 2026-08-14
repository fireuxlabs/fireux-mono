<template>
  <section id="franchise" class="friiites-lower-section friiites-franchise" data-landing-scene="franchise">
    <div>
      <h2>Franchise</h2>
      <p>Bring Friiites to your community.</p>
      <span class="friiites-franchise__action">Franchise enquiries</span>
    </div>
    <div class="friiites-franchise__objects" aria-label="Friiites franchise brand kit">
      <img src="/img/app/branding/staff-apron.png" alt="Friiites staff apron" loading="lazy">
      <img src="/img/app/branding/storefront-fascia.png" alt="Friiites storefront fascia" loading="lazy">
      <img src="/img/app/branding/takeaway-bag.png" alt="Friiites takeaway bag" loading="lazy">
    </div>
  </section>
</template>

<style scoped>
.friiites-franchise { grid-template-columns: minmax(14rem, 0.65fr) minmax(18rem, 1.35fr); align-items: center; overflow: hidden; }
.friiites-franchise > div { z-index: 1; }
.friiites-franchise__action { display: inline-flex; width: fit-content; margin-top: calc(var(--spacing) * 6); padding: calc(var(--spacing) * 3) calc(var(--spacing) * 5); color: var(--friiites-gold); border: 1px solid currentColor; font-weight: var(--font-weight-extrabold); letter-spacing: var(--tracking-widest); text-transform: uppercase; }
.friiites-franchise__objects { display: grid; grid-template-columns: 0.8fr 1.5fr 0.65fr; align-items: end; }
.friiites-franchise__objects img { width: 100%; max-height: 23rem; object-fit: contain; filter: drop-shadow(0 calc(var(--spacing) * 4) calc(var(--spacing) * 4) rgb(0 0 0 / 50%)); }
.friiites-franchise__objects img:nth-child(2) { align-self: center; width: 115%; margin-left: -8%; }
@media (max-width: 42rem) { .friiites-franchise { grid-template-columns: 1fr; } .friiites-franchise__objects { margin-top: calc(var(--spacing) * 6); } }
</style>
