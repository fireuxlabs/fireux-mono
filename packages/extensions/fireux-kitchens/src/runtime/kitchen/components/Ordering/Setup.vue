<template>
  <section class="space-y-6" aria-labelledby="ordering-setup-title">
    <header>
      <h2 id="ordering-setup-title" class="text-xl font-semibold">
        Set up website ordering
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ name || 'Your Kitchen' }} · saved settings are shared with your
        Workspace.
      </p>
    </header>
    <MoleculesStateCard v-if="outcome === 'pending'" entity="Kitchen" loading />
    <UAlert
      v-else-if="outcome === 'error'"
      title="Kitchen settings could not be loaded"
      color="error"
    />
    <UAlert
      v-else-if="!selectedKitchen || !canWrite"
      title="Kitchen access is unavailable for this account"
      color="neutral"
    />
    <template v-else>
      <section class="space-y-3" aria-labelledby="ordering-services-title">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 id="ordering-services-title" class="font-semibold">
            Menus, hours and ordering
          </h3>
          <UButton
            label="Manage menus"
            color="neutral"
            variant="soft"
            @click="openWorkspace('/workspace/kitchen/menus')"
          />
        </div>
        <p
          v-if="menusOutcome === 'idle' || menusOutcome === 'pending'"
          role="status"
        >
          Loading saved menus…
        </p>
        <UAlert
          v-else-if="menusOutcome === 'error'"
          title="Menus could not be loaded"
          color="error"
        />
        <p v-else-if="!menus.length" class="text-sm text-muted">
          Add a menu in your Workspace, then return here to choose its service
          hours.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="option in websiteOptions"
            :key="option.key"
            :label="'Configure ' + option.label.toLowerCase()"
            color="neutral"
            variant="outline"
            :disabled="!canWrite || !['ready', 'empty'].includes(menusOutcome)"
            @click="openSetup(option)"
          />
        </div>
        <p v-if="!entries.length" class="text-sm text-muted">
          No website ordering service is saved yet.
        </p>
        <UCard v-for="entry in entries" :key="entry.service.id">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h4 class="font-semibold">{{ entry.service.name }}</h4>
            <UBadge
              :color="entry.service.enabled ? 'success' : 'neutral'"
              variant="subtle"
              >{{ entry.service.enabled ? 'Enabled' : 'Off' }}</UBadge
            >
          </div>
          <ul class="mt-3 space-y-2 text-sm">
            <li
              v-for="check in entry.summary.checks"
              :key="check.key"
              class="flex gap-2"
            >
              <UIcon
                :name="check.done ? 'i-lucide-check' : 'i-lucide-circle'"
                class="shrink-0"
              />
              <span
                >{{ check.label }} ·
                {{
                  check.pending
                    ? 'Checking'
                    : check.done
                      ? 'Configured'
                      : 'Needed'
                }}</span
              >
            </li>
          </ul>
          <p v-if="entry.summary.configured" class="mt-3 text-sm text-muted">
            Menu and service configuration saved. Payment and installation still
            need review.
          </p>
          <p v-if="entry.summary.paused" class="mt-3 text-sm text-warning">
            Ordering is paused.
          </p>
          <WorkspaceKitchenServicesCustomerLinks
            :service="entry.service"
            :menus="menus"
            :menus-outcome="menusOutcome"
            :kitchen-slug="selectedKitchen.slug"
            :open-workspace="openWorkspace"
            class="mt-4"
          />
        </UCard>
      </section>
      <section class="space-y-3 border-t border-default pt-5">
        <h3 class="font-semibold">Payment and website installation</h3>
        <p class="text-sm text-muted">
          Review payment methods and delivery zones, then allow your website and
          copy its ordering button.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            label="Payment & delivery"
            color="neutral"
            variant="soft"
            @click="openWorkspace('/workspace/kitchen/fulfilment')"
          />
          <UButton
            label="Website & installation"
            color="neutral"
            variant="soft"
            @click="openWorkspace('/workspace/kitchen/settings/integrations')"
          />
        </div>
      </section>
      <section class="space-y-3 border-t border-default pt-5">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-semibold">Prove an order</h3>
          <UBadge color="neutral" variant="subtle">Unverified</UBadge>
        </div>
        <p class="text-sm text-muted">
          Saved settings and an enabled service do not prove delivery. Preview
          checkout, then check one labelled order reaches Incoming exactly once.
          Continue through acceptance, payment choice, preparation, printing and
          completion.
        </p>
        <p class="text-sm text-muted">
          Customer links are real ordering. Submitting creates an order; online
          payment may charge money.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            label="Open Incoming"
            color="neutral"
            variant="outline"
            @click="openWorkspace('/workspace/kitchen/orders')"
          />
          <UButton
            v-if="!props.inWorkspace"
            label="Continue in Workspace"
            @click="openWorkspace(workspaceEntryPath)"
          />
        </div>
      </section>
    </template>
    <UModal
      v-model:open="setupOpen"
      :title="selectedOption?.label || 'Ordering service'"
      description="Use the same menus and settings as your Workspace. Nothing changes until you save."
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body>
        <template v-if="selectedOption">
          <UFormField v-if="optionServices.length" label="Service" class="mb-4">
            <USelect
              v-model="selectedServiceId"
              :items="[
                { value: '__new__', label: 'Create a new service' },
                ...optionServices.map((service) => ({
                  value: service.id,
                  label: service.name,
                })),
              ]"
              class="w-full"
            />
          </UFormField>
          <WorkspaceKitchenServicesSetup
            :key="
              kitchenId + ':' + selectedOption.key + ':' + selectedServiceId
            "
            :option="selectedOption"
            :service="selectedService"
            :menus="menus"
            :menus-outcome="menusOutcome"
            :timezone="timezone"
            :disabled="!canWrite"
            :save="configure"
            :open-workspace="openWorkspace"
            @saved="setupOpen = false"
          />
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            class="mt-4"
            @click="setupOpen = false"
          />
        </template>
      </template>
    </UModal>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { useKitchenServices } from '../../composables/workspace/services/useKitchenServices'
import { serviceSetupSummary } from '../../utils/service-setup-summary'
import {
  kitchenServiceOptions,
  servicesForOption,
  type KitchenServiceOption,
} from '../../utils/service-options'
const props = defineProps<{ kitchenId: string; inWorkspace?: boolean }>()
const {
  selectedKitchen,
  kitchenId,
  outcome,
  name,
  services,
  menus,
  menusOutcome,
  timezone,
  canWrite,
  configure,
} = useKitchenServices(() => props.kitchenId)
const { currentUser } = useAuth()
const workspace = useWorkspace('kitchen')
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const websiteOptions = kitchenServiceOptions.filter((option) =>
  ['collection', 'delivery', 'pre_order'].includes(option.key)
)
const entries = computed(() =>
  services.value
    .filter((service) =>
      websiteOptions.some(
        (option) => servicesForOption([service], option).length
      )
    )
    .map((service) => ({
      service,
      summary: serviceSetupSummary(service, menus.value, menusOutcome.value),
    }))
)
const setupOpen = ref(false)
const selectedOption = ref<KitchenServiceOption>()
const selectedServiceId = ref('__new__')
const optionServices = computed(() =>
  selectedOption.value
    ? servicesForOption(services.value, selectedOption.value)
    : []
)
const selectedService = computed(() =>
  optionServices.value.find((service) => service.id === selectedServiceId.value)
)
function openSetup(option: KitchenServiceOption) {
  selectedOption.value = option
  selectedServiceId.value =
    servicesForOption(services.value, option)[0]?.id || '__new__'
  setupOpen.value = true
}
watch(
  [currentUser, kitchenId, canWrite],
  () => {
    setupOpen.value = false
    selectedOption.value = undefined
  },
  { flush: 'sync' }
)
function openWorkspace(path: string) {
  if (
    !canWrite.value ||
    !kitchenId.value ||
    kitchenId.value !== props.kitchenId
  )
    return
  workspace.select(kitchenId.value)
  return navigateTo(path)
}
</script>
