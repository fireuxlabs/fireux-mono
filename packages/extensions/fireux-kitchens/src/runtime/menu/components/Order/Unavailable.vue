<template>
  <section
    class="menu-order-unavailable"
    aria-labelledby="menu-order-unavailable-title"
  >
    <div class="menu-order-unavailable__message" role="alert">
      <p v-if="kitchenName" class="menu-order-unavailable__kitchen">
        {{ kitchenName }}
      </p>
      <h1 id="menu-order-unavailable-title">
        {{ failure.title }}
      </h1>
      <p class="menu-order-unavailable__description">
        {{ failure.description }}
      </p>
    </div>

    <nav
      v-if="browsePath || kitchenPath"
      class="menu-order-unavailable__actions"
      aria-label="Collection alternatives"
    >
      <NuxtLink
        v-if="browsePath"
        :to="browsePath"
        class="menu-order-unavailable__action menu-order-unavailable__action--primary"
        data-menu-action="browse"
      >
        See other options
      </NuxtLink>

      <NuxtLink
        v-if="kitchenPath"
        :to="kitchenPath"
        class="menu-order-unavailable__action"
        data-menu-action="kitchen"
        :aria-label="kitchenName ? `Contact ${kitchenName}` : 'Contact the kitchen'"
      >
        Contact the kitchen
      </NuxtLink>
    </nav>
  </section>
</template>

<script setup lang="ts">
import type { MenuLoadFailure } from '../../composables/useMenu'

withDefaults(defineProps<{
  failure: MenuLoadFailure
  browsePath?: string
  kitchenName?: string
  kitchenPath?: string
}>(), {
  browsePath: '',
  kitchenName: '',
  kitchenPath: '',
})
</script>

<style scoped>
.menu-order-unavailable {
  display: grid;
  min-height: min(34rem, 72vh);
  place-content: center;
  justify-items: center;
  gap: calc(var(--spacing) * 4);
  width: min(100%, 38rem);
  margin: auto;
  text-align: center;
}

.menu-order-unavailable__message {
  display: grid;
  justify-items: center;
  gap: calc(var(--spacing) * 4);
}

.menu-order-unavailable__message p,
.menu-order-unavailable h1 {
  margin: 0;
}

.menu-order-unavailable__kitchen {
  max-width: 100%;
  color: var(--menu-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-black);
  letter-spacing: 0.12em;
  overflow-wrap: anywhere;
  text-transform: uppercase;
}

.menu-order-unavailable h1 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(2.2rem, 8vw, var(--text-7xl));
  letter-spacing: -0.04em;
  line-height: 1;
}

.menu-order-unavailable__description {
  max-width: 42rem;
  color: var(--menu-muted);
  line-height: 1.6;
}

.menu-order-unavailable__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 3);
  margin-top: calc(var(--spacing) * 2);
}

.menu-order-unavailable__action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.65rem calc(var(--spacing) * 4);
  border: 1px solid color-mix(in srgb, var(--menu-primary) 45%, transparent);
  border-radius: var(--menu-radius);
  color: var(--menu-primary);
  font-size: 0.9rem;
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
}

.menu-order-unavailable__action--primary {
  background: var(--menu-primary);
  color: var(--menu-bg);
}

.menu-order-unavailable__action:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.25rem;
}

@media (max-width: 30rem) {
  .menu-order-unavailable__actions,
  .menu-order-unavailable__action {
    width: 100%;
  }
}
</style>
