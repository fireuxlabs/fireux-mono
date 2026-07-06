<template>
  <header class="menu-header">
    <div class="menu-header__identity">
      <MenuDetailHeading
        :kitchen-name="menu.presentation.kitchenName"
        :name="menu.content.name"
        :description="menu.content.description"
      />
    </div>

    <div class="menu-header__service-row">
      <ClientOnly>
        <span
          class="menu-service-times-chip"
          :class="{
            'menu-service-times-chip--open': derivedMenuServiceTimes.open,
            'menu-service-times-chip--closed':
              derivedMenuServiceTimes.known && !derivedMenuServiceTimes.open,
            'menu-service-times-chip--unknown': !derivedMenuServiceTimes.known,
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
            'menu-surface-rail__link',
            { 'menu-surface-rail__link--active': surface.active },
          ]"
        >
          {{ surface.label }}
        </NuxtLink>
      </nav>

      <span
        v-else-if="surfaceLabel"
        class="menu-surface-chip"
      >
        {{ surfaceLabel }}
      </span>

      <MenuDetailChoiceToggle
        v-if="choices.length > 1"
        :model-value="modelValue"
        :options="choices"
        :menu-context="menu.behaviour.context"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
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
const showSurfaceRail = computed(() =>
  props.menu.behaviour.context === 'generic' && props.surfaceOptions.length > 0
)
const { menuServiceChip: derivedMenuServiceTimes } =
  useMenuServiceComputed(menuServiceTimes)
</script>

<style scoped>
.menu-header {
  display: grid;
  gap: clamp(1rem, 2.4vw, 1.5rem);
  justify-items: stretch;
  width: min(100%, 62rem);
  margin: 0 auto;
  text-align: left;
}

.menu-header__identity {
  min-width: 0;
}

.menu-header :deep(.menu-detail-heading) {
  justify-items: start;
  text-align: left;
}

.menu-header :deep(.menu-detail-heading h1) {
  max-width: min(100%, 13ch);
}

.menu-header :deep(.menu-detail-heading__description) {
  max-width: 36rem;
  line-height: 1.45;
}

.menu-header__service-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--menu-space-xs);
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.menu-header__service-row :deep(.menu-choice-stack) {
  width: auto;
  justify-items: start;
}

.menu-header__service-row :deep(.menu-method-select) {
  width: 12rem;
}

.menu-service-times-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.85rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid currentcolor;
  border-radius: var(--menu-radius-control);
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu-service-times-chip--open {
  background: color-mix(in srgb, #16a34a 16%, var(--menu-bg));
  color: #15803d;
}

.menu-service-times-chip--closed {
  background: color-mix(in srgb, #dc2626 14%, var(--menu-bg));
  color: #b91c1c;
}

.menu-service-times-chip--unknown {
  background: color-mix(in srgb, var(--menu-text) 8%, var(--menu-bg));
  color: var(--menu-muted);
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
  display: inline-flex;
  min-height: 2.1rem;
  align-items: center;
  justify-content: center;
  padding: 0.42rem 0.78rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 28%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-bg) 90%, var(--menu-primary));
  color: var(--menu-primary);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.1;
  text-decoration: none;
}

.menu-surface-rail__link:hover,
.menu-surface-rail__link--active,
.menu-surface-chip {
  background: var(--menu-primary);
  color: var(--menu-bg);
}

@media (max-width: 640px) {
  .menu-header__service-row {
    align-items: stretch;
  }

  .menu-header__service-row :deep(.menu-choice-stack),
  .menu-header__service-row :deep(.menu-method-select) {
    width: 100%;
  }
}
</style>
