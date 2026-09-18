<template>
  <section class="workspace-surface">
    <UPageHeader title="Channels" description="Share a service with guests." />
    <UPageGrid>
      <UPageCard
        title="Website button"
        description="Open a service from your website."
      />
      <UPageCard
        title="Kiosk devices"
        description="Activate or revoke tablets."
        to="/workspace/kitchen/settings/kiosks"
      />
      <UPageCard
        title="Point of sale"
        description="Staff ordering is not ready yet."
      />
    </UPageGrid>
    <MoleculesStateCard
      v-if="
        outcome === 'pending' ||
        outcome === 'idle' ||
        menusOutcome === 'pending'
      "
      entity="Service channels"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error' || menusOutcome === 'error'"
      entity="Service channels"
      state="error"
    />
    <UAlert
      v-else-if="!selectedKitchen"
      title="Choose a Kitchen to configure channels"
    />
    <UAlert
      v-else-if="!services.length"
      title="Create a service before sharing it"
    />
    <template v-else>
      <UFormField label="Service"
        ><USelect
          v-model="serviceId"
          :items="serviceOptions"
          class="w-full sm:max-w-sm"
      /></UFormField>
      <WorkspaceKitchenChannelsWebsiteButton
        v-if="service && selectedKitchen"
        :key="service.id"
        :service="service"
        :menus="menus"
        :kitchen="selectedKitchen"
      />
    </template>
    <UButton
      to="/workspace/kitchen/orders/services"
      label="Manage services"
      color="neutral"
      variant="outline"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenServices } from '../../../composables/workspace/services/useKitchenServices'
const { menus, selectedKitchen, outcome, menusOutcome, services } =
  useKitchenServices()
const serviceId = ref('')
const serviceOptions = computed(() =>
  services.value.map((service) => ({
    label: service.name + (service.enabled ? '' : ' · Off'),
    value: service.id,
  }))
)
const service = computed(() =>
  services.value.find((service) => service.id === serviceId.value)
)
watch(
  services,
  (list) => {
    if (!list.some((service) => service.id === serviceId.value))
      serviceId.value = list[0]?.id || ''
  },
  { immediate: true }
)
</script>
