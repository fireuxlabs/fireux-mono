<template>
  <main class="baeren-home">
    <section class="baeren-home__hero" aria-labelledby="baeren-home-title">
      <BaerenHomeBackdrop />

      <div class="baeren-home__hero-content">
        <BaerenHomeTitle />

        <div class="baeren-home__actions" aria-label="Direkt auswählen">
          <UButton
            :to="content.links.booking"
            target="_blank"
            rel="noopener noreferrer"
            label="Zimmer buchen"
            icon="i-lucide-calendar-check"
            color="neutral"
            size="lg"
            block
            class="baeren-home__action baeren-home__action--primary"
          />
          <UButton
            to="/menus"
            label="Speisekarte"
            icon="i-lucide-utensils"
            color="neutral"
            variant="outline"
            size="lg"
            block
            class="baeren-home__action baeren-home__action--secondary"
          />
          <UButton
            :to="deliveryMenuPath"
            label="Lieferung bestellen"
            icon="i-lucide-bike"
            color="primary"
            size="lg"
            block
            class="baeren-home__action baeren-home__action--delivery"
          />
          <UButton
            to="/location"
            label="Route"
            icon="i-lucide-map-pin"
            color="neutral"
            variant="outline"
            size="lg"
            block
            class="baeren-home__action baeren-home__action--route"
          />
          <UButton
            :to="hotelPhoneHref"
            label="Anrufen"
            icon="i-lucide-phone"
            color="neutral"
            variant="outline"
            size="lg"
            block
            class="baeren-home__action baeren-home__action--phone"
          />
        </div>
      </div>
    </section>

    <BaerenHomeSurfaces />
  </main>
</template>

<script setup lang="ts">
import {
  menuRoutePath,
  tenantMenuRouteScope,
} from 'fireux-kitchens/runtime/kitchen/utils/kitchen-menu-route'
import { baerenRinggenbergContent } from '../../../config/content.config'
import kitchenConfig from '../../../config/kitchen.config'

defineOptions({ name: 'BaerenHomeHero' })

const content = baerenRinggenbergContent
const deliveryMenuPath = menuRoutePath({
  scope: tenantMenuRouteScope(),
  menuId: kitchenConfig.primaryMenuId,
  context: 'delivery',
})
const hotelPhoneHref = `tel:${content.contacts.hotel.phone.replace(/\s/g, '')}`
</script>

<style scoped>
.baeren-home {
  min-height: 100svh;
  background: var(--baeren-canvas);
  color: var(--baeren-ink);
}

.baeren-home__hero {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: max(39rem, 100svh);
  flex-direction: column;
  background: var(--baeren-forest);
  color: var(--baeren-on-dark);
}

.baeren-home__hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  flex: 1;
  align-content: start;
  gap: calc(var(--spacing) * 5);
  padding: 1.35rem 1rem calc(6.75rem + env(safe-area-inset-bottom));
}

.baeren-home__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

:deep(.baeren-home__action) {
  min-height: 3rem;
  justify-content: center;
  border-radius: calc(var(--ui-radius) * 4);
  font-size: 0.88rem;
  font-weight: 850;
}

:deep(.baeren-home__action--primary) {
  border: 1px solid rgb(var(--baeren-on-dark-rgb) / 48%);
  background: var(--baeren-forest-raised);
  color: var(--baeren-on-dark);
  box-shadow: 0 0.5rem 1.25rem rgb(var(--baeren-action-shadow-rgb) / 22%);
}

:deep(.baeren-home__action--secondary) {
  border: 1px solid rgb(var(--baeren-on-dark-rgb) / 42%);
  background: var(--baeren-accent);
  color: var(--baeren-on-dark);
  box-shadow: 0 0.5rem 1.25rem rgb(var(--baeren-action-shadow-rgb) / 22%);
}

:deep(.baeren-home__action--delivery) {
  grid-column: 1 / -1;
  border: 1px solid rgb(var(--baeren-ink-rgb) / 22%);
  background: var(--baeren-event);
  color: var(--baeren-event-ink);
  box-shadow: 0 0.75rem 1.75rem rgb(var(--baeren-action-shadow-rgb) / 24%);
}

:deep(.baeren-home__action--route),
:deep(.baeren-home__action--phone) {
  border: 1px solid var(--baeren-border-hover);
  background: rgb(var(--baeren-surface-rgb) / 92%);
  color: var(--baeren-ink);
  box-shadow: 0 0.5rem 1.25rem rgb(var(--baeren-action-shadow-rgb) / 18%);
}

@media (max-width: 55.999rem) {
  .baeren-home__hero-content {
    grid-template-rows: auto minmax(0, 1fr);
  }

  .baeren-home__actions {
    align-self: center;
  }
}

@media (min-width: 56rem) {
  .baeren-home__hero {
    display: grid;
    min-height: 100svh;
  }

  .baeren-home__hero-content {
    grid-area: 1 / 1;
    width: min(62rem, calc(100% - 4rem));
    min-height: 100svh;
    align-content: end;
    margin-inline: max(2rem, calc((100vw - 80rem) / 2));
    padding: 10rem 0 8rem;
  }

  .baeren-home__actions {
    width: min(32rem, 100%);
  }
}
</style>
