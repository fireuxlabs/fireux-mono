<template>
  <div class="menu-order-intro">
    <MenuIdentity
      :currency-code="currencyCode"
      :description="description"
      heading-id="menu-order-title"
      :image-shade="imageShade"
      :image-url="imageUrl"
      :kitchen-name="kitchenName"
      :logo-image-url="logoImageUrl"
      :menu-name="menuName"
      :show-currency="showCurrency"
      :wordmark-image-url="wordmarkImageUrl"
    />

    <MenuSurfaceSwitcher
      heading-id="menu-order-mode-title"
      :icon="contextIcon"
      :label="contextLabel"
      :message="message"
      :options="surfaceOptions"
    />
  </div>
</template>

<script setup lang="ts">
import type { GuestMenuSurfaceOption } from '../../../utils/menu-context'

const props = withDefaults(defineProps<{
  menuName: string
  description?: string
  kitchenName?: string
  currencyCode?: string
  showCurrency?: boolean
  imageShade?: 'light' | 'dark' | 'none'
  imageUrl?: string
  logoImageUrl?: string
  wordmarkImageUrl?: string
  contextLabel: string
  contextIcon: string
  message: string
  surfaceOptions?: GuestMenuSurfaceOption[]
}>(), {
  description: '',
  kitchenName: '',
  currencyCode: '',
  showCurrency: true,
  imageShade: 'none',
  imageUrl: '',
  logoImageUrl: '',
  wordmarkImageUrl: '',
  surfaceOptions: () => [],
})
</script>

<style scoped>
.menu-order-intro {
  display: grid;
  gap: clamp(1.25rem, 4vw, 2rem);
}

</style>
