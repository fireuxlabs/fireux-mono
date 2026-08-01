<!-- Concurrent edit — 2026-07-22 12:20 CEST — Product Demo pass: let embedded Menu presentations suppress route-owned exit chrome. -->
<template>
  <header
    class="menu-identity"
    :class="`menu-identity--${presentation}`"
    :data-menu-identity="identityKind"
  >
    <div class="menu-identity__copy">
      <div
        v-if="$slots.utility"
        class="menu-identity__utility"
        data-menu-identity-utility
      >
        <slot name="utility" />
      </div>

      <MenuClose
        v-if="showExit && !isKioskMenu"
        class="menu-identity__close"
        :aria-label="resolvedExitLabel"
        :kind="exitKind"
        :to="exitPath"
      />

      <p v-if="kitchenName" class="menu-identity__kitchen">
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        {{ kitchenName }}
      </p>

      <h1 :id="headingId">
        {{ menuName }}
      </h1>

      <p v-if="description" class="menu-identity__description">
        {{ description }}
      </p>

      <div
        v-if="showCurrency && currencyCode"
        class="menu-identity__currency"
        aria-label="`Prices in ${currencyCode}`"
      >
        <span>{{ pricesLabel }}</span>
        <strong>{{ currencyCode }}</strong>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuExit } from '../../composables/fireux/menu/useMenuExit'

const props = withDefaults(defineProps<{
  identityKind?: 'menu' | 'kitchen-menu'
  backToMenusLabel?: string
  closeMenuLabel?: string
  headingId?: string
  kitchenName?: string
  menuName: string
  description?: string
  currencyCode?: string
  showCurrency?: boolean
  presentation?: 'framed' | 'open'
  pricesLabel?: string
  showExit?: boolean
}>(), {
  identityKind: 'kitchen-menu',
  backToMenusLabel: 'Back to menus',
  closeMenuLabel: 'Close menu',
  headingId: 'menu-title',
  kitchenName: '',
  description: '',
  currencyCode: '',
  showCurrency: true,
  presentation: 'framed',
  pricesLabel: 'Prices',
  showExit: true,
})
const {
  exitKind,
  exitLabel: defaultExitLabel,
  exitPath,
  isKioskMenu,
} = useMenuExit()
const resolvedExitLabel = computed(() =>
  exitKind.value === 'close'
    ? props.closeMenuLabel || defaultExitLabel.value
    : props.backToMenusLabel || defaultExitLabel.value
)

</script>

<style scoped>
.menu-identity {
  box-sizing: border-box;
  display: grid;
  justify-items: center;
  width: min(100%, 52rem);
  min-width: 0;
  margin: 0 auto;
  text-align: center;
}

.menu-identity__copy {
  position: relative;
  display: grid;
  justify-items: center;
  width: 100%;
  min-width: 0;
  padding: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 7));
  border: 1px solid color-mix(in srgb, var(--menu-text) 13%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-secondary) 4%, var(--menu-bg));
}

.menu-identity--open .menu-identity__copy {
  padding: calc(var(--spacing) * 3) 0;
  border: 0;
  background: transparent;
}

.menu-identity__close {
  --menu-close-size: 2.75rem;
  --menu-close-icon-size: 1.4rem;

  position: absolute;
  z-index: 2;
  top: 0.75rem;
  right: 0.75rem;
}

.menu-identity__utility {
  position: absolute;
  z-index: 2;
  top: 0.75rem;
  left: 0.75rem;
}

.menu-identity__kitchen {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  max-width: 100%;
  margin: 0;
  color: var(--menu-secondary);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  overflow-wrap: anywhere;
}

.menu-identity__kitchen :deep(.iconify) {
  flex: 0 0 auto;
}

.menu-identity h1 {
  max-width: 14ch;
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(var(--text-3xl), 7vw, var(--text-5xl));
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.04em;
  line-height: 1;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.menu-identity__description {
  max-width: 36rem;
  margin: 0.65rem auto 0;
  color: var(--menu-muted);
  font-size: clamp(0.9rem, 1.8vw, var(--text-base));
  line-height: 1.45;
  white-space: pre-line;
}

.menu-identity__currency {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  margin-top: 0.85rem;
  padding: 0.3rem 0.55rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg));
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
}

.menu-identity__currency strong {
  color: var(--menu-primary);
  font-size: 0.76rem;
  letter-spacing: var(--tracking-wider);
}

@media (max-width: 35rem) {
  .menu-identity__copy {
    padding: calc(var(--spacing) * 5) calc(var(--spacing) * 4);
    border-radius: var(--menu-radius);
  }

  .menu-identity h1 {
    margin-top: 0.4rem;
    font-size: clamp(var(--text-3xl), 9vw, var(--text-4xl));
  }

  .menu-identity__description {
    margin-top: calc(var(--spacing) * 2);
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .menu-identity__currency {
    margin-top: 0.65rem;
  }
}
</style>
