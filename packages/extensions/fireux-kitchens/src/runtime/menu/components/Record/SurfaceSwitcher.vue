<template>
  <section class="menu-surface-switcher" :aria-labelledby="headingId">
    <div class="menu-surface-switcher__summary">
      <span class="menu-surface-switcher__icon" aria-hidden="true">
        <UIcon :name="icon" />
      </span>

      <div class="menu-surface-switcher__copy">
        <div class="menu-surface-switcher__heading">
          <h2 :id="headingId">{{ label }}</h2>
          <UBadge
            v-if="statusLabel"
            :color="statusColor"
            size="sm"
            variant="soft"
          >
            {{ statusLabel }}
          </UBadge>
        </div>
        <p>{{ message }}</p>
      </div>
    </div>

    <details
      v-if="otherOptions.length"
      class="menu-surface-switcher__change"
      :open="openByDefault"
    >
      <summary>
        Change
        <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
      </summary>

      <MenuRecordSurfaceRail :options="otherOptions" />
    </details>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GuestMenuSurfaceOption } from '../../utils/menu-context'

const props = withDefaults(
  defineProps<{
    headingId?: string
    icon: string
    label: string
    message: string
    openByDefault?: boolean
    options?: GuestMenuSurfaceOption[]
    statusColor?: 'neutral' | 'success' | 'error'
    statusLabel?: string
  }>(),
  {
    headingId: 'menu-surface-title',
    openByDefault: false,
    options: () => [],
    statusColor: 'neutral',
    statusLabel: '',
  }
)

const otherOptions = computed(() =>
  props.options.filter((option) => !option.active)
)
</script>

<style scoped>
.menu-surface-switcher {
  position: relative;
  display: grid;
  gap: calc(var(--spacing) * 3);
  width: min(100%, 40rem);
  margin: 0 auto;
  padding: 0.8rem;
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 30%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-secondary) 7%, var(--menu-bg));
  text-align: left;
}

.menu-surface-switcher p,
.menu-surface-switcher h2 {
  margin: 0;
}

.menu-surface-switcher__summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.7rem;
  align-items: center;
  padding-inline-end: calc(var(--spacing) * 18);
}

.menu-surface-switcher__icon {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--menu-primary) 16%, var(--menu-bg));
  color: var(--menu-primary);
}

.menu-surface-switcher__icon :deep(.iconify) {
  width: 1.05rem;
  height: 1.05rem;
}

.menu-surface-switcher__copy {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
}

.menu-surface-switcher__heading {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  align-items: center;
}

.menu-surface-switcher h2 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: var(--text-base);
  line-height: 1.15;
}

.menu-surface-switcher__copy > p {
  color: var(--menu-muted);
  font-size: 0.8rem;
  line-height: 1.4;
}

.menu-surface-switcher__change summary {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  display: inline-flex;
  gap: var(--spacing);
  align-items: center;
  padding: 0.38rem calc(var(--spacing) * 2);
  border-radius: 9999px;
  color: var(--menu-primary);
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: var(--font-weight-black);
  list-style: none;
}

.menu-surface-switcher__change summary::-webkit-details-marker {
  display: none;
}

.menu-surface-switcher__change summary:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 2px;
}

.menu-surface-switcher__change summary :deep(.iconify) {
  transition: transform 150ms ease;
}

.menu-surface-switcher__change[open] summary :deep(.iconify) {
  transform: rotate(180deg);
}

.menu-surface-switcher__change :deep(.menu-surface-rail) {
  justify-content: stretch;
  width: 100%;
  margin-top: calc(var(--spacing) * 3);
  padding-top: calc(var(--spacing) * 3);
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  gap: 0.4rem;
}

.menu-surface-switcher__change :deep(.menu-surface-rail__link) {
  flex: 1 1 0;
  min-height: 2.35rem;
  padding: 0.48rem 0.6rem;
  font-size: 0.76rem;
}
</style>
