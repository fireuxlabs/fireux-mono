<template>
  <section class="workspace-surface">
    <UPageHeader title="Ordering channels" />
    <UPageGrid>
      <UPageCard
        title="Website button"
        description="Open the shared checkout from your website."
      />
      <UPageCard
        title="Kiosk devices"
        description="Activate or revoke tablets."
        to="/workspace/kitchen/orders/kiosks"
      />
      <UPageCard
        title="Point of sale"
        description="Staff ordering is not ready yet."
      />
    </UPageGrid>
    <MoleculesStateCard
      v-if="outcome === 'pending' || menusOutcome === 'pending'"
      entity="Ordering channels"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error' || menusOutcome === 'error'"
      entity="Ordering channels"
      state="error"
    />
    <UAlert
      v-else-if="!selectedKitchen"
      title="Choose a Kitchen to configure channels"
    />
    <MoleculesStateCard
      v-else-if="!menus.length"
      entity="Menus"
      state="empty"
    />
    <UFormField v-else label="Menu"
      ><USelect v-model="menuId" :items="menuOptions"
    /></UFormField>
    <WorkspaceKitchenChannelsWebsiteButton
      v-if="menu && selectedKitchen && menusOutcome === 'ready'"
      :menu="menu"
      :kitchen="selectedKitchen"
      :ordering="ordering"
    />
    <UButton
      to="/workspace/kitchen/ordering"
      label="Configure ordering services"
      color="neutral"
      variant="outline"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenOrdering } from '../../../composables/workspace/ordering/useKitchenOrdering'
import { kitchenMenuOrdering } from '../../../../menu/utils/menu-ordering'
const { menus, selectedKitchen, outcome, menusOutcome } = useKitchenOrdering()
const menuId = ref('')
const menuOptions = computed(() =>
  menus.value.map((menu) => ({ label: menu.name, value: menu.id }))
)
const menu = computed(() =>
  menus.value.find((menu) => menu.id === menuId.value)
)
const ordering = computed(() =>
  kitchenMenuOrdering(selectedKitchen.value?.ordering, menuId.value)
)
watch(
  menus,
  (list) => {
    if (!list.some((menu) => menu.id === menuId.value))
      menuId.value = list[0]?.id || ''
  },
  { immediate: true }
)
</script>
