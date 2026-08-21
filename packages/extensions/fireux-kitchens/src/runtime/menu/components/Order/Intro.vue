<template>
  <div class="menu-order-intro">
    <MenuIdentity
      :currency-code="currencyCode"
      :description="description"
      heading-id="menu-order-title"
      :kitchen-name="kitchenName"
      :menu-name="menuName"
      :show-currency="showCurrency"
    />

    <MenuSurfaceSwitcher
      heading-id="menu-order-mode-title"
      :icon="contextIcon"
      :label="contextLabel"
      :message="message"
      :options="surfaceOptions"
      :status-color="statusColor"
      :status-label="statusLabel"
    />
  </div>
</template>

<script setup lang="ts">
import type { GuestMenuSurfaceOption } from '../../utils/menu-context'

withDefaults(
  defineProps<{
    menuName: string
    description?: string
    kitchenName?: string
    currencyCode?: string
    showCurrency?: boolean
    contextLabel: string
    contextIcon: string
    message: string
    surfaceOptions?: GuestMenuSurfaceOption[]
    statusColor?: 'neutral' | 'success' | 'error'
    statusLabel?: string
  }>(),
  {
    description: '',
    kitchenName: '',
    currencyCode: '',
    showCurrency: true,
    surfaceOptions: () => [],
    statusColor: 'neutral',
    statusLabel: '',
  }
)
</script>

<style scoped>
.menu-order-intro {
  display: grid;
  gap: clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 8));
}
</style>
