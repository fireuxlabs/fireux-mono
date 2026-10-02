<template>
  <section class="workspace-surface">
    <UPageHeader
      title="Services"
      description="Choose how customers can order, then set the menus and serving hours for each service."
    />
    <UButton to="/workspace/kitchen/settings/integrations" label="Set up ordering" icon="i-lucide-list-checks" color="neutral" variant="outline" />
    <MoleculesStateCard
      v-if="outcome === 'pending' || outcome === 'idle'"
      entity="Kitchen services"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Kitchen services"
      state="error"
    />
    <template v-else-if="selectedKitchen">
      <WorkspaceKitchenTablesWrite :key="kitchenId" />
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-semibold">Saved offerings</h2>
            <WorkspaceKitchenServicesCreate
              :key="kitchenId"
              :disabled="!canWrite"
              :create="create"
            />
          </div>
        </template>
        <div v-if="services.length" class="divide-y divide-default">
          <NuxtLink
            v-for="service in services"
            :key="service.id"
            :to="'/workspace/kitchen/orders/services/' + service.id"
            class="flex items-center justify-between gap-3 py-3"
          >
            <span>{{ service.name }}</span>
            <UBadge
              :color="service.enabled ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ service.enabled ? 'Enabled' : 'Off' }}
            </UBadge>
          </NuxtLink>
        </div>
        <p v-else class="text-sm text-muted">No saved offerings.</p>
      </UCard>
      <div class="grid items-start gap-4 lg:grid-cols-2">
        <UCard v-for="entry in entries" :key="entry.option.key">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <UIcon
                :name="entry.option.icon"
                class="size-6 shrink-0"
                :class="entry.enabled ? 'text-primary' : 'text-muted'"
                aria-hidden="true"
              />
              <h2 class="text-lg font-semibold">{{ entry.option.label }}</h2>
            </div>
            <USwitch
              v-if="entry.services.length < 2 || !entry.enabled"
              :model-value="entry.enabled"
              :aria-label="entry.option.label + ' availability'"
              :disabled="!canWrite"
              @update:model-value="(value) => openSetup(entry.option, value)"
            />
            <UBadge
              v-else
              :color="entry.enabled ? 'success' : 'neutral'"
              variant="subtle"
              >{{ entry.enabled ? 'On' : 'Off' }}</UBadge
            >
          </div>
          <p class="mt-3 text-sm text-muted">{{ entry.option.description }}</p>
          <template v-if="entry.enabled">
            <p
              v-if="entry.services.length > 1"
              class="mt-4 text-sm font-medium"
            >
              {{ entry.services.length }} offerings configured
            </p>
            <div
              v-for="service in entry.services"
              :key="service.id"
              class="mt-3 border-t border-default pt-3 text-sm"
            >
              <div class="flex flex-wrap items-center gap-2">
                <span v-if="entry.services.length > 1" class="font-medium">{{
                  service.name
                }}</span
                ><span class="text-muted">{{ menuNames(service) }}</span>
              </div>
              <p class="mt-1 whitespace-pre-line text-muted">
                {{
                  formatWeekdayTimeText(service.hours) || 'Serving hours needed'
                }}
              </p>
            </div>
            <UButton
              label="Configure"
              color="neutral"
              variant="soft"
              trailing-icon="i-lucide-arrow-right"
              class="mt-5"
              :disabled="!canWrite"
              @click="openSetup(entry.option)"
            />
          </template>
        </UCard>
      </div>
    </template>
    <UAlert v-else title="Choose a Kitchen to configure services" />
    <UModal
      v-model:open="setupOpen"
      :title="selectedOption?.label || 'Service'"
      description="Choose menus, serving hours and ordering settings. Changes apply together when you save."
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body>
        <template v-if="selectedOption">
          <UFormField
            v-if="optionServices.length > 1"
            label="Offering"
            class="mb-5"
            ><USelect
              v-model="selectedServiceId"
              @update:model-value="requestedEnabled = undefined"
              :items="
                optionServices.map((service) => ({
                  value: service.id,
                  label: service.name,
                }))
              "
              class="w-full"
          /></UFormField>
          <WorkspaceKitchenServicesSetup
            :key="
              kitchenId + ':' + selectedOption.key + ':' + selectedServiceId
            "
            :option="selectedOption"
            :service="selectedService"
            :menus="menus"
            :menus-outcome="menusOutcome"
            :timezone="timezone"
            :requested-enabled="requestedEnabled"
            :disabled="!canWrite"
            :save="configure"
            @saved="setupOpen = false"
          />
        </template>
      </template>
    </UModal>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenServices } from '../../../composables/workspace/services/useKitchenServices'
import {
  kitchenServiceOptions,
  servicesForOption,
  serviceOptionEnabled,
  type KitchenServiceOption,
} from '../../../utils/service-options'
import { formatWeekdayTimeText } from '../../../../utils/weekday-time'
import type { KitchenService } from '../../../models/service.model'
const {
  selectedKitchen,
  kitchenId,
  outcome,
  services,
  canWrite,
  menus,
  menusOutcome,
  timezone,
  configure,
  create,
} = useKitchenServices()
const entries = computed(() =>
  kitchenServiceOptions.map((option) => ({
    option,
    services: servicesForOption(services.value, option),
    enabled: servicesForOption(services.value, option).some((service) =>
      serviceOptionEnabled(service, option)
    ),
  }))
)
const setupOpen = ref(false)
const selectedOption = ref<KitchenServiceOption>()
const selectedServiceId = ref('')
const requestedEnabled = ref<boolean>()
const optionServices = computed(() =>
  selectedOption.value
    ? servicesForOption(services.value, selectedOption.value)
    : []
)
const selectedService = computed(() =>
  optionServices.value.find((service) => service.id === selectedServiceId.value)
)
function openSetup(option: KitchenServiceOption, enabled?: boolean) {
  selectedOption.value = option
  const matching = servicesForOption(services.value, option)
  selectedServiceId.value =
    matching.find((service) => serviceOptionEnabled(service, option))?.id ||
    matching[0]?.id ||
    ''
  requestedEnabled.value = enabled ?? (matching.length ? undefined : true)
  setupOpen.value = true
}
watch(kitchenId, () => {
  setupOpen.value = false
  selectedServiceId.value = ''
  selectedOption.value = undefined
})
watch(canWrite, (allowed) => {
  if (!allowed) setupOpen.value = false
})
function menuNames(service: KitchenService) {
  if (menusOutcome.value === 'error') return 'Menus unavailable'
  if (!['ready', 'empty'].includes(menusOutcome.value)) return 'Loading menus…'
  return (
    menus.value
      .filter((menu) => service.menu_ids.includes(menu.id))
      .map((menu) => menu.name)
      .join(', ') || 'Choose menus'
  )
}
</script>
