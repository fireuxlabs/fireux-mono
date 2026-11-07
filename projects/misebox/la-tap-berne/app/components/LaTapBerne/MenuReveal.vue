<template>
  <UButton
    v-if="!isOpen"
    class="latap-glass"
    icon="i-ph-fork-knife"
    label="View menu"
    size="xl"
    @click="openMenu"
  />
  <UModal
    :open="isOpen"
    fullscreen
    title="La Tap Berne menu"
    description="Comida Casera"
    @update:open="(value) => (value ? openMenu() : closeMenu())"
  >
    <template #body>
      <MenuDetail menu-id="food" :menu-route-scope="menuRouteScope" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useMiseboxTenantChrome } from 'fireux-misebox/runtime/composables/fireux/app/useMiseboxTenantChrome'
import { rootMenuRouteScope } from 'fireux-kitchens/runtime/menu/utils/navigation/route'
import { onBeforeUnmount, ref } from 'vue'

const { setChromeHidden } = useMiseboxTenantChrome()
const menuRouteScope = rootMenuRouteScope()
const isOpen = ref(false)

const openMenu = () => {
  isOpen.value = true
  setChromeHidden(true)
}

const closeMenu = () => {
  isOpen.value = false
  setChromeHidden(false)
}

onBeforeUnmount(() => {
  setChromeHidden(false)
})
</script>
