<template>
  <section v-if="menu" class="menu-profile">
    <header class="menu-profile__header">
      <div class="menu-profile__identity">
        <h2 class="menu-profile__title">{{ menuName }}</h2>
        <p v-if="menuDescription" class="fx-type-body">{{ menuDescription }}</p>
      </div>
      <UButton
        v-if="menuStatus === 'published' && publicMenuPath"
        :to="publicMenuPath"
        color="neutral"
        variant="ghost"
        trailing-icon="i-lucide-arrow-up-right"
        label="View public Menu"
      />
    </header>
    <div class="workspace-panel-actions">
      <UBadge :color="statusColor" variant="subtle">{{ menuStatus }}</UBadge>
      <UBadge
        v-if="sectionsCount !== undefined"
        color="neutral"
        variant="subtle"
        >{{ sectionLabel }}</UBadge
      >
      <span class="fx-type-caption">{{ orderingLabel }}</span>
    </div>
    <footer v-if="$slots.footer" class="menu-profile__actions">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  menuRoutePath,
  tenantMenuRouteScope,
  directoryMenuRouteScope,
} from '../../../../utils/kitchen-menu-route'
import type { KitchenMenu as Menu } from '../../../../../menu/utils/kitchen-menu.ts'

const props = withDefaults(
  defineProps<{
    menu?: Menu | null
    kitchenSlug?: string
    sectionsCount?: number
  }>(),
  {
    menu: null,
    kitchenSlug: '',
  }
)

const fireux = useFireUXConfig()
const publicMenuPath = computed(() =>
  menuRoutePath({
    scope: fireux.isTenant
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(props.kitchenSlug),
    menuId: props.menu?.id,
  })
)

const text = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => text(props.menu?.name) || 'Untitled menu')
const menuDescription = computed(() => text(props.menu?.description))
const menuStatus = computed(() => text(props.menu?.status) || 'draft')
const statusColor = computed(() =>
  menuStatus.value === 'published'
    ? 'success'
    : menuStatus.value === 'archived'
      ? 'neutral'
      : 'warning'
)
const orderingEnabled = computed(
  () =>
    props.menu?.ordering?.enabled === true &&
    Array.isArray(props.menu?.ordering?.order_types) &&
    props.menu.ordering.order_types.length > 0
)
const orderingLabel = computed(() =>
  orderingEnabled.value ? 'Ordering enabled' : 'Browse only'
)
const sectionLabel = computed(
  () => `${props.sectionsCount} section${props.sectionsCount === 1 ? '' : 's'}`
)
</script>

<style scoped>
.menu-profile {
  display: grid;
  gap: calc(var(--spacing) * 5);
}
.menu-profile__header {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}
.menu-profile__identity {
  display: grid;
  gap: calc(var(--spacing) * 2);
  min-width: 0;
}
.menu-profile__title {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--ui-text-highlighted);
}
.menu-profile__actions {
  padding-top: calc(var(--spacing) * 5);
}
</style>
