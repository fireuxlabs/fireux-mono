<template>
  <div class="space-y-10">
    <section class="baeren-hero">
      <div class="baeren-hero__backdrop" aria-hidden="true" />

      <div class="baeren-hero__content mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl space-y-6">
          <img
            src="/img/app/logo.png"
            alt="Hotel Bären Ringgenberg"
            class="size-28 object-contain drop-shadow-xl"
          >

          <div class="baeren-glass space-y-6 rounded-3xl p-6 sm:p-8">
            <div class="space-y-3">
              <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
                Hotel Bären Ringgenberg
              </h1>
              <p class="max-w-2xl text-lg opacity-85">
                Hotel, restaurant and bar in Ringgenberg. Browse the existing Bären menu or find the venue.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <UButton to="/hotel" size="xl" icon="i-lucide-bed-double">Hotel</UButton>
              <UButton to="/menu" size="xl" color="neutral" variant="solid" icon="i-lucide-utensils">Menu</UButton>
              <UButton to="/events" size="xl" color="neutral" variant="solid" icon="i-lucide-calendar-days">Events</UButton>
              <UButton to="/location" size="xl" color="neutral" variant="solid" icon="i-lucide-map-pin">Location</UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-4 md:grid-cols-3">
      <UPageCard title="Hotel" description="37 guest rooms close to Lake Brienz and Interlaken." to="/hotel" icon="i-lucide-bed-double" />
      <UPageCard title="Restaurant and bar" description="Regional cooking, pizza, snacks and drinks." to="/menu" icon="i-lucide-utensils" />
      <UPageCard title="Events" description="Weddings, celebrations, meetings and live events." to="/events" icon="i-lucide-calendar-days" />
    </div>
  </div>
</template>

<script setup lang="ts">
const scrollNudgeKey = 'baeren-home-scroll-nudge'
let scrollNudgeTimer: ReturnType<typeof setTimeout> | undefined

definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-house',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'Hotel Bären Ringgenberg',
  description: 'Menu and venue information for Hotel Bären Ringgenberg.',
})

onMounted(() => {
  const shouldSkip =
    window.location.hash.length > 0 ||
    window.scrollY > 8 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    sessionStorage.getItem(scrollNudgeKey) === 'done'

  if (shouldSkip) return

  scrollNudgeTimer = setTimeout(() => {
    if (window.scrollY > 8) return

    sessionStorage.setItem(scrollNudgeKey, 'done')
    window.scrollTo({
      top: Math.min(window.innerHeight * 0.28, 220),
      behavior: 'smooth',
    })
  }, 900)
})

onBeforeUnmount(() => {
  if (scrollNudgeTimer) clearTimeout(scrollNudgeTimer)
})
</script>

<style scoped>
.baeren-hero {
  position: relative;
  width: 100vw;
  margin-block-start: calc(var(--spacing-m) * -1);
  margin-inline-start: calc(50% - 50vw);
}

.baeren-hero__backdrop {
  position: sticky;
  top: 0;
  height: 100svh;
  background-image: url('/img/app/background.png');
  background-position: center;
  background-size: cover;
}

.baeren-hero__content {
  position: relative;
  z-index: 1;
  margin-block-start: -100svh;
  padding-block-start: calc(100svh + 4rem);
  padding-block-end: 8rem;
}

.baeren-glass {
  border: 1px solid rgb(255 255 255 / 32%);
  background: rgb(15 23 42 / 32%);
  color: white;
  box-shadow: 0 0.85rem 2rem rgb(0 0 0 / 24%);
  backdrop-filter: blur(20px) saturate(120%);
}
</style>
