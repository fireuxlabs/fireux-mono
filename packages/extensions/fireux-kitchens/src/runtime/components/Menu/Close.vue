<template>
  <NuxtLink
    :to="to"
    class="menu-close"
    :aria-label="ariaLabel"
    data-menu-action="exit"
    :data-menu-exit-kind="kind"
  >
    <UIcon
      aria-hidden="true"
      name="i-lucide-x"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  ariaLabel?: string
  kind?: 'back' | 'close'
  to: string
}>(), {
  ariaLabel: 'Close menu',
  kind: 'close',
})
</script>

<style scoped>
.menu-close {
  display: grid;
  width: var(--menu-close-size, 4.5rem);
  height: var(--menu-close-size, 4.5rem);
  padding: 0;
  place-items: center;
  border: 1px solid var(
    --menu-close-border,
    color-mix(in srgb, var(--menu-primary, currentColor) 42%, transparent)
  );
  border-radius: 999px;
  background: var(
    --menu-close-bg,
    color-mix(
      in srgb,
      var(--menu-bg, Canvas) 82%,
      var(--menu-primary, currentColor) 18%
    )
  );
  color: var(--menu-close-fg, var(--menu-text, var(--ui-text, currentColor)));
  cursor: pointer;
  overflow: hidden;
  text-decoration: none;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.menu-close--top-right,
.menu-close--bottom-left {
  position: fixed;
  z-index: 50;
}

.menu-close--top-right {
  top: calc(1rem + env(safe-area-inset-top));
  right: calc(1rem + env(safe-area-inset-right));
}

.menu-close--bottom-left {
  bottom: calc(1rem + env(safe-area-inset-bottom));
  left: calc(1rem + env(safe-area-inset-left));
}

.menu-close:hover {
  transform: translateY(-2px);
}

.menu-close:focus-visible {
  outline: 2px solid var(--menu-close-focus, var(--menu-secondary, currentColor));
  outline-offset: 3px;
}

.menu-close :deep(.iconify) {
  width: var(--menu-close-icon-size, 2.5rem);
  height: var(--menu-close-icon-size, 2.5rem);
}

@media (min-width: 40rem) {
  .menu-close--top-right {
    top: calc(2rem + env(safe-area-inset-top));
    right: calc(2rem + env(safe-area-inset-right));
  }

  .menu-close--bottom-left {
    bottom: calc(2rem + env(safe-area-inset-bottom));
    left: calc(2rem + env(safe-area-inset-left));
  }
}
</style>
