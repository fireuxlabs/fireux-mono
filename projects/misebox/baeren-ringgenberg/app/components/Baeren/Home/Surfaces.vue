<template>
  <article
    data-baeren-home-surface
    data-side="right"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--overview baeren-home-scroll__surface--right"
  >
    <header class="baeren-home-scroll__surface-header">
      <div>
        <p class="baeren-home-scroll__eyebrow">Multi-surface</p>
        <h2 class="baeren-home-scroll__surface-title">One Bären. Eight ways in.</h2>
      </div>
      <img
        src="/img/app/logo.png"
        alt=""
        class="size-16 rounded-full object-cover shadow-lg"
      >
    </header>

    <p class="baeren-home-scroll__copy">
      Stay, eat, browse, gather or get in touch with Hotel Bären Ringgenberg.
    </p>

    <nav class="baeren-home-scroll__route-grid" aria-label="Explore Hotel Bären">
      <NuxtLink to="/hotel" class="baeren-home-scroll__route">
        <UIcon name="i-lucide-bed-double" />
        <span>Hotel</span>
      </NuxtLink>
      <NuxtLink to="/menu" class="baeren-home-scroll__route">
        <UIcon name="i-lucide-utensils" />
        <span>Menu</span>
      </NuxtLink>
      <NuxtLink to="/products" class="baeren-home-scroll__route">
        <UIcon name="i-lucide-box" />
        <span>Products</span>
      </NuxtLink>
      <NuxtLink to="/blog" class="baeren-home-scroll__route">
        <UIcon name="i-lucide-newspaper" />
        <span>Blog</span>
      </NuxtLink>
      <NuxtLink to="/events" class="baeren-home-scroll__route">
        <UIcon name="i-lucide-calendar-days" />
        <span>Events</span>
      </NuxtLink>
      <NuxtLink to="/about" class="baeren-home-scroll__route">
        <UIcon name="i-lucide-circle-user-round" />
        <span>About &amp; Contact</span>
      </NuxtLink>
      <NuxtLink to="/location" class="baeren-home-scroll__route">
        <UIcon name="i-lucide-map-pin" />
        <span>Location</span>
      </NuxtLink>
      <NuxtLink to="/jobs" class="baeren-home-scroll__route">
        <UIcon name="i-lucide-briefcase-business" />
        <span>Jobs</span>
      </NuxtLink>
    </nav>
  </article>

  <article
    data-baeren-home-surface
    data-side="left"
    data-pair-position="even"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--left"
  >
    <div class="baeren-home-scroll__icon">
      <UIcon name="i-lucide-bed-double" />
    </div>
    <p class="baeren-home-scroll__eyebrow">Hotel</p>
    <h2 class="baeren-home-scroll__surface-title">Stay between Lake Brienz and Interlaken.</h2>
    <p class="baeren-home-scroll__copy">
      37 guest rooms for solo travellers, couples, families and groups of up to eight.
    </p>
    <div class="baeren-home-scroll__facts">
      <span>37 rooms</span>
      <span>1–8 guests</span>
    </div>
    <UButton to="/hotel" label="Explore the hotel" trailing-icon="i-lucide-arrow-right" color="neutral" />
  </article>

  <article
    data-baeren-home-surface
    data-side="right"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--right"
  >
    <div class="baeren-home-scroll__icon">
      <UIcon name="i-lucide-utensils" />
    </div>
    <p class="baeren-home-scroll__eyebrow">Menu</p>
    <h2 class="baeren-home-scroll__surface-title">A table in the heart of Ringgenberg.</h2>
    <p class="baeren-home-scroll__copy">
      Regional cooking, pizza, snacks and drinks from the Bären restaurant and bar.
    </p>
    <UButton to="/menu" label="View the menu" trailing-icon="i-lucide-arrow-right" color="neutral" />
  </article>

  <article
    data-baeren-home-surface
    data-side="left"
    data-pair-position="even"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--left"
  >
    <div class="baeren-home-scroll__icon">
      <UIcon name="i-lucide-box" />
    </div>
    <p class="baeren-home-scroll__eyebrow">Products</p>
    <h2 class="baeren-home-scroll__surface-title">Products from the Bären.</h2>
    <p class="baeren-home-scroll__copy">
      Browse the products collection available through the Bären Ringgenberg app.
    </p>
    <UButton to="/products" label="Browse products" trailing-icon="i-lucide-arrow-right" color="neutral" />
  </article>

  <article
    data-baeren-home-surface
    data-side="right"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--right"
  >
    <div class="baeren-home-scroll__icon">
      <UIcon name="i-lucide-newspaper" />
    </div>
    <p class="baeren-home-scroll__eyebrow">Blog</p>
    <h2 class="baeren-home-scroll__surface-title">Stories from the Bären.</h2>
    <p class="baeren-home-scroll__copy">
      Hotel news, event announcements and notes from Ringgenberg belong in the Bären blog.
    </p>
    <UButton to="/blog" label="Open the blog" trailing-icon="i-lucide-arrow-right" color="neutral" />
  </article>

  <article
    data-baeren-home-surface
    data-side="left"
    data-pair-position="even"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--left"
  >
    <div class="baeren-home-scroll__icon">
      <UIcon name="i-lucide-calendar-days" />
    </div>
    <p class="baeren-home-scroll__eyebrow">Events</p>
    <h2 class="baeren-home-scroll__surface-title">Gather, celebrate and stay.</h2>
    <p class="baeren-home-scroll__copy">
      A Ringgenberg setting for weddings, celebrations, meetings and live events.
    </p>
    <UButton to="/events" label="Explore events" trailing-icon="i-lucide-arrow-right" color="neutral" />
  </article>

  <article
    data-baeren-home-surface
    data-side="right"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--right"
  >
    <div class="baeren-home-scroll__icon">
      <UIcon name="i-lucide-circle-user-round" />
    </div>
    <p class="baeren-home-scroll__eyebrow">About &amp; Contact</p>
    <h2 class="baeren-home-scroll__surface-title">Meet the Bären and reach the right team.</h2>
    <p class="baeren-home-scroll__copy">
      Learn about the house and find direct contacts for the hotel, restaurant and events.
    </p>
    <UButton to="/about" label="About & contact" trailing-icon="i-lucide-arrow-right" color="neutral" />
  </article>

  <article
    data-baeren-home-surface
    data-side="left"
    data-pair-position="even"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--left"
  >
    <div class="baeren-home-scroll__icon">
      <UIcon name="i-lucide-map-pin" />
    </div>
    <p class="baeren-home-scroll__eyebrow">Location</p>
    <h2 class="baeren-home-scroll__surface-title">Find the Bären in Ringgenberg.</h2>
    <p class="baeren-home-scroll__copy">
      Open the map and plan your route to the hotel in the centre of Ringgenberg.
    </p>
    <UButton to="/location" label="Map and directions" trailing-icon="i-lucide-arrow-right" color="neutral" />
  </article>

  <article
    data-baeren-home-surface
    data-side="right"
    class="baeren-home-scroll__surface baeren-home-scroll__surface--right"
  >
    <div class="baeren-home-scroll__icon">
      <UIcon name="i-lucide-briefcase-business" />
    </div>
    <p class="baeren-home-scroll__eyebrow">Jobs</p>
    <h2 class="baeren-home-scroll__surface-title">Jobs at the Bären.</h2>
    <p class="baeren-home-scroll__copy">
      Browse roles published for the Bären hotel, restaurant, bar and kitchen.
    </p>
    <UButton to="/jobs" label="View jobs" trailing-icon="i-lucide-arrow-right" color="neutral" />
  </article>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaerenHomeSurfaces' })
</script>

<style scoped>
.baeren-home-scroll__surface {
  display: flex;
  width: min(35rem, calc(100vw - 2rem));
  min-height: 18rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: clamp(1.35rem, 3vw, 2rem);
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 2rem;
  background: linear-gradient(145deg, rgb(15 23 42 / 76%), rgb(15 23 42 / 48%));
  color: white;
  box-shadow: 0 1.25rem 3rem rgb(0 0 0 / 28%);
  backdrop-filter: blur(16px) saturate(115%);
}

.baeren-home-scroll__surface--overview {
  margin-block-start: 5svh;
}

.baeren-home-scroll__surface[data-pair-position='even'] {
  margin-block-start: -7svh;
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.baeren-home-scroll__surface[data-pair-position='even'][data-landing-settled='true'] {
  transform: translate3d(0, -1cm, 0);
}

.baeren-home-scroll__surface--right {
  align-self: flex-end;
}

.baeren-home-scroll__surface[data-clipping='true'] {
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent calc(var(--baeren-surface-clip) - 14px),
    black calc(var(--baeren-surface-clip) + 14px)
  );
  mask-image: linear-gradient(
    to bottom,
    transparent calc(var(--baeren-surface-clip) - 14px),
    black calc(var(--baeren-surface-clip) + 14px)
  );
}

.baeren-home-scroll__surface-header {
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.baeren-home-scroll__eyebrow {
  margin: 0;
  color: rgb(255 255 255 / 68%);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.baeren-home-scroll__surface-title {
  margin: 0.25rem 0 0;
  font-size: clamp(1.8rem, 3.5vw, 2.65rem);
  font-weight: 750;
  line-height: 1.02;
  letter-spacing: -0.035em;
}

.baeren-home-scroll__copy {
  max-width: 38ch;
  margin: 0;
  color: rgb(255 255 255 / 82%);
  font-size: 1rem;
  line-height: 1.6;
}

.baeren-home-scroll__icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: 1rem;
  background: rgb(255 255 255 / 12%);
  font-size: 1.35rem;
}

.baeren-home-scroll__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.baeren-home-scroll__facts span {
  padding: 0.4rem 0.7rem;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 999px;
  background: rgb(255 255 255 / 10%);
  font-size: 0.8rem;
  font-weight: 700;
}

.baeren-home-scroll__route-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.baeren-home-scroll__route {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 0.9rem;
  background: rgb(255 255 255 / 10%);
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.baeren-home-scroll__route:hover {
  border-color: rgb(255 255 255 / 40%);
  background: rgb(255 255 255 / 18%);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .baeren-home-scroll__surface {
    width: 100%;
  }
}
</style>
