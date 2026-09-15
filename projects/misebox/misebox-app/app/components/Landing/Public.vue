<template>
  <UContainer class="pb-16 sm:pb-24">
    <section class="food-intro" aria-labelledby="food-title">
      <p class="food-intro__eyebrow">
        <UIcon name="i-lucide-utensils" class="size-4" /> Find something
        delicious
      </p>
      <div class="food-intro__heading">
        <h1 id="food-title">Your next<br /><span>favourite bite.</span></h1>
        <div class="food-intro__aside">
          <p>Explore the Kitchens.<br />See what’s on the menu.</p>
          <UButton
            to="/menus"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-arrow-up-right"
            class="mt-5 px-0"
            >Browse all Menus</UButton
          >
        </div>
      </div>
    </section>

    <section
      id="discover"
      class="scroll-mt-24"
      aria-labelledby="discover-title"
    >
      <h2 id="discover-title" class="sr-only">Explore Kitchens</h2>
      <div
        v-if="pending"
        class="grid gap-8 sm:grid-cols-2"
        aria-label="Loading Kitchens"
      >
        <USkeleton v-for="i in 2" :key="i" class="h-80 rounded-2xl" />
      </div>
      <UAlert
        v-else-if="error"
        title="Kitchens couldn’t load"
        description="Please try again."
        color="neutral"
        variant="soft"
        :actions="[{ label: 'Try again', onClick: refresh }]"
      />
      <KitchenCollection v-else-if="kitchens.length" :kitchens="kitchens" />
      <UAlert
        v-else
        title="More Kitchens are on the way"
        description="Explore the available Menus in the meantime."
        color="neutral"
        variant="soft"
        :actions="[{ label: 'Browse Menus', to: '/menus' }]"
      />
    </section>

    <section
      class="mt-16 flex flex-col justify-between gap-6 border-t border-default pt-8 sm:flex-row sm:items-center"
    >
      <div>
        <h2 class="text-lg font-semibold">Run a Kitchen?</h2>
        <p class="mt-1 text-sm text-muted">
          Give your guests a place to find your menu.
        </p>
      </div>
      <UButton
        to="/product"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-arrow-up-right"
        class="rounded-full"
        >Misebox for Kitchen teams</UButton
      >
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import { useKitchenCollection } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenCollection'
const { collection: kitchens, pending, error, refresh } = useKitchenCollection()
</script>

<style scoped>
.food-intro {
  padding: clamp(2.5rem, 6vw, 5rem) 0 2.75rem;
}
.food-intro__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--ui-text-muted);
  font-size: 0.75rem;
  margin-bottom: 1.75rem;
}
.food-intro__eyebrow :deep(svg) {
  color: var(--ui-primary);
}
.food-intro__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 3rem;
}
.food-intro h1 {
  margin: 0;
  font-size: clamp(3.6rem, 7.5vw, 6.5rem);
  letter-spacing: -0.065em;
  line-height: 0.96;
  font-weight: 550;
  color: var(--ui-text-highlighted);
}
.food-intro h1 span {
  color: var(--ui-primary);
}
.food-intro__aside {
  padding-bottom: 0.35rem;
  min-width: 13rem;
}
.food-intro__aside p {
  color: var(--ui-text-muted);
  font-size: 1rem;
  line-height: 1.7;
}
@media (max-width: 48rem) {
  .food-intro {
    padding-top: 2.5rem;
    padding-bottom: 2rem;
  }
  .food-intro__heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .food-intro__aside {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
  }
  .food-intro__aside p {
    font-size: 0.85rem;
  }
  .food-intro__aside :deep(a) {
    margin-top: 0;
    font-size: 0.8rem;
  }
}
</style>
