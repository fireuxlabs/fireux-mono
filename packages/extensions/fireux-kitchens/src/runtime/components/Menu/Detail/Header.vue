<template>
  <header class="menu-header">
    <div class="menu-header__identity">
      <MenuDetailHeaderHeading
        align="start"
        :kitchen-name="menu.presentation.kitchenName"
        :name="menu.content.name"
        :description="menu.content.description"
      />
    </div>

    <div class="menu-header__service-row">
      <ClientOnly>
        <span
          v-if="derivedMenuServiceTimes.label"
          class="menu-header-chip menu-service-times-chip"
          :class="{
            'menu-service-times-chip--open':
              derivedMenuServiceTimes.color === 'success',
            'menu-service-times-chip--closed':
              derivedMenuServiceTimes.color === 'error',
            'menu-service-times-chip--unknown':
              derivedMenuServiceTimes.color === 'neutral',
          }"
        >
          {{ derivedMenuServiceTimes.label }}
        </span>
      </ClientOnly>

      <nav
        v-if="showSurfaceRail"
        class="menu-surface-rail"
        aria-label="Ordering surfaces"
      >
        <NuxtLink
          v-for="surface in surfaceOptions"
          :key="surface.value"
          :to="surface.to"
          :class="[
            'menu-header-chip',
            'menu-surface-rail__link',
            { 'menu-surface-rail__link--active': surface.active },
          ]"
        >
          {{ surface.label }}
        </NuxtLink>
      </nav>

      <span
        v-else-if="surfaceLabel"
        class="menu-header-chip menu-surface-chip"
      >
        {{ surfaceLabel }}
      </span>

      <MenuDetailHeaderChoiceToggle
        v-if="choices.length > 1"
        :model-value="modelValue"
        :options="choices"
        :menu-context="menu.behaviour.context"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>

    <section
      v-if="showPreOrderNotice"
      class="menu-pre-order-notice"
    >
      <UIcon
        name="i-lucide-calendar-clock"
        class="menu-pre-order-notice__icon"
        aria-hidden="true"
      />

      <div class="menu-pre-order-notice__copy">
        <strong>Pre-order for large groups</strong>
        <span>{{ preOrderNotice }}</span>
        <span v-if="preOrderDepositNotice">{{ preOrderDepositNotice }}</span>
      </div>

      <span
        class="menu-header-chip menu-pre-order-notice__status menu-pre-order-notice__status--offline"
      >
        Kitchen confirmation
      </span>
    </section>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuChoiceOption,
  MenuChoiceValue,
  MenuSurfaceOption,
} from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type { MenuManifest } from '../../../models/kitchen/menu/menu-detail.model'
import { useMenuServiceComputed } from '../../../composables/fireux/firestore/menu/useMenu'
import { menuOrderDepositLabel } from '../../../utils/menu-ordering-ui'

const props = defineProps<{
  menu: MenuManifest
  modelValue: MenuChoiceValue
  choices: MenuChoiceOption[]
  surfaceOptions: MenuSurfaceOption[]
  surfaceLabel: string
}>()

defineEmits<{
  (event: 'update:modelValue', value: MenuChoiceValue): void
}>()

const menuServiceTimes = computed(() =>
  props.menu.behaviour.ordering.service_hours?.operation_hours
)
const orderType = computed(() =>
  props.menu.behaviour.orderingEnabled
    ? props.menu.behaviour.defaultOrderType
    : undefined
)
const showSurfaceRail = computed(() =>
  props.menu.behaviour.surface === 'generic' && props.surfaceOptions.length > 0
)
const { menuServiceChip: derivedMenuServiceTimes } =
  useMenuServiceComputed(menuServiceTimes, { orderType })
const preOrderPolicy = computed(() =>
  props.menu.behaviour.ordering.order_types.find((type) =>
    type.type === 'pre_order'
  )
)
const showPreOrderNotice = computed(() =>
  props.menu.behaviour.context === 'pre_order' || orderType.value === 'pre_order'
)
const preOrderNoticeHours = computed(() =>
  Math.max(1, Number(preOrderPolicy.value?.notice_hours || 24))
)
const preOrderDepositCurrency = computed(() =>
  props.menu.presentation.currencyCode.trim().toUpperCase()
)
const preOrderDepositLabel = computed(() =>
  menuOrderDepositLabel(
    preOrderPolicy.value?.fulfilment?.deposit,
    preOrderDepositCurrency.value
  )
)
const preOrderNotice = computed(() =>
  `For large groups, we appreciate a pre-order. Please send it at least ${preOrderNoticeHours.value} hours before you arrive.`
)
const preOrderDepositNotice = computed(() =>
  preOrderDepositLabel.value
    ? `Secure payment for the ${preOrderDepositLabel.value} is required before the kitchen can accept this pre-order.`
    : ''
)
</script>

<style scoped>
.menu-header {
  display: grid;
  gap: clamp(calc(var(--spacing) * 4), 2.4vw, calc(var(--spacing) * 6));
  justify-items: stretch;
  width: min(100%, 62rem);
  margin: 0 auto;
  text-align: left;
}

.menu-header__identity {
  min-width: 0;
}

.menu-header__service-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--menu-space-xs);
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.menu-header-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--menu-header-chip-height, 1.85rem);
  padding: var(--menu-header-chip-padding, 0.3rem 0.7rem);
  border: 1px solid var(--menu-header-chip-border, currentcolor);
  border-radius: var(--menu-radius-control);
  background: var(--menu-header-chip-bg, transparent);
  color: var(--menu-header-chip-color, currentcolor);
  font-size: var(--menu-header-chip-size, 0.72rem);
  font-weight: var(--menu-header-chip-weight, 950);
  letter-spacing: var(--menu-header-chip-spacing, 0);
  line-height: 1.1;
}

.menu-service-times-chip {
  --menu-header-chip-spacing: 0.1em;

  text-transform: uppercase;
}

.menu-service-times-chip--open {
  --menu-header-chip-bg: color-mix(in srgb, #16a34a 16%, var(--menu-bg));
  --menu-header-chip-color: #15803d;
}

.menu-service-times-chip--closed {
  --menu-header-chip-bg: color-mix(in srgb, #dc2626 14%, var(--menu-bg));
  --menu-header-chip-color: #b91c1c;
}

.menu-service-times-chip--unknown {
  --menu-header-chip-bg: color-mix(in srgb, var(--menu-text) 8%, var(--menu-bg));
  --menu-header-chip-color: var(--menu-muted);
}

.menu-surface-rail {
  display: flex;
  flex-wrap: wrap;
  gap: var(--menu-space-xs);
  justify-content: flex-start;
  width: auto;
}

.menu-surface-rail__link,
.menu-surface-chip {
  --menu-header-chip-height: 2.1rem;
  --menu-header-chip-padding: 0.42rem 0.78rem;
  --menu-header-chip-border: color-mix(in srgb, var(--menu-primary) 28%, transparent);
  --menu-header-chip-bg: color-mix(in srgb, var(--menu-bg) 90%, var(--menu-primary));
  --menu-header-chip-color: var(--menu-primary);
  --menu-header-chip-size: 0.76rem;
  --menu-header-chip-weight: 900;

  text-decoration: none;
}

.menu-surface-rail__link:hover,
.menu-surface-rail__link--active,
.menu-surface-chip {
  --menu-header-chip-bg: var(--menu-primary);
  --menu-header-chip-color: var(--menu-bg);
}

.menu-pre-order-notice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--menu-space-sm);
  align-items: start;
  width: 100%;
  padding: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 22%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-bg) 86%, var(--menu-primary));
}

.menu-pre-order-notice__icon {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--menu-primary);
}

.menu-pre-order-notice__copy {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
  color: var(--menu-text);
  font-size: 0.88rem;
  line-height: 1.35;
}

.menu-pre-order-notice__copy strong {
  font-size: 0.92rem;
  font-weight: 950;
}

.menu-pre-order-notice__status {
  --menu-header-chip-padding: 0.3rem 0.62rem;
  --menu-header-chip-border: color-mix(in srgb, var(--menu-text) 14%, transparent);
}

.menu-pre-order-notice__status--online {
  --menu-header-chip-border: color-mix(in srgb, #16a34a 32%, transparent);
  --menu-header-chip-bg: color-mix(in srgb, #16a34a 16%, var(--menu-bg));
  --menu-header-chip-color: #15803d;
}

.menu-pre-order-notice__status--offline {
  --menu-header-chip-border: color-mix(in srgb, #d97706 30%, transparent);
  --menu-header-chip-bg: color-mix(in srgb, #d97706 12%, var(--menu-bg));
  --menu-header-chip-color: #b45309;
}

@media (max-width: 640px) {
  .menu-header__service-row {
    align-items: stretch;
  }

  .menu-pre-order-notice {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .menu-pre-order-notice__status {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
