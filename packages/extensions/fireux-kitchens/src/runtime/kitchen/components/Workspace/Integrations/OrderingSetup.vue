<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">
        Set up ordering · {{ name || kitchen.slug }}
      </h2>
      <p class="mt-1 text-sm text-muted">Use your saved menus and services.</p>
    </template>
    <div class="space-y-6">
      <section class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="font-semibold">Menus</h3>
          <UButton
            to="/workspace/kitchen/menus"
            label="Manage menus"
            color="neutral"
            variant="soft"
          />
        </div>
        <MoleculesStateCard
          v-if="menusOutcome === 'idle' || menusOutcome === 'pending'"
          entity="Menus"
          loading
        />
        <MoleculesStateCard
          v-else-if="menusOutcome === 'error'"
          entity="Menus"
          state="error"
        />
        <p v-else-if="!menus.length" class="text-sm text-muted">
          No saved menus. Add a menu in Menus.
        </p>
        <div v-else class="flex flex-wrap gap-2">
          <UButton
            v-for="menu in menus"
            :key="menu.id"
            :to="
              '/workspace/kitchen/menus/' +
              encodeURIComponent(menu.slug || menu.id)
            "
            :label="
              menu.name +
              (menu.status === 'published'
                ? ' · Published'
                : ' · Not published')
            "
            color="neutral"
            variant="outline"
          />
        </div>
      </section>
      <section class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="font-semibold">Services</h3>
          <UButton
            to="/workspace/kitchen/orders/services"
            label="Manage services"
            color="neutral"
            variant="soft"
          />
        </div>
        <p v-if="!services.length" class="text-sm text-muted">
          No saved services. Configure pickup in Services.
        </p>
        <div
          v-for="entry in entries"
          :key="entry.service.id"
          class="space-y-3 rounded-lg border border-default p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <NuxtLink
              :to="servicePath(entry.service.id)"
              class="font-medium text-primary"
              >{{ entry.service.name }}</NuxtLink
            >
            <UBadge
              :color="entry.service.enabled ? 'success' : 'neutral'"
              variant="subtle"
              >{{ entry.service.enabled ? 'Enabled' : 'Off' }}</UBadge
            >
          </div>
          <ul class="space-y-2 text-sm">
            <li
              v-for="check in entry.summary.checks"
              :key="check.key"
              class="flex items-center gap-2"
            >
              <UIcon
                :name="
                  check.pending
                    ? 'i-lucide-loader'
                    : check.done
                      ? 'i-lucide-check'
                      : 'i-lucide-circle'
                "
                class="shrink-0"
              />
              <NuxtLink :to="servicePath(entry.service.id) + check.href">{{
                check.label
              }}</NuxtLink>
            </li>
          </ul>
          <p v-if="entry.summary.paused" class="text-sm text-warning">
            Ordering is paused.
          </p>
          <WorkspaceKitchenServicesCustomerLinks
            :service="entry.service"
            :menus="menus"
            :menus-outcome="menusOutcome"
            :kitchen-slug="kitchen.slug"
          />
        </div>
      </section>
      <section class="space-y-3 border-t border-default pt-4">
        <h3 class="font-semibold">Finish with a test order</h3>
        <p class="text-sm text-muted">
          These checks cover saved configuration only. Verify items, prices and
          payment at checkout, then confirm the order reaches Incoming. Customer
          links use real ordering; submitting creates an order.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            to="/workspace/kitchen/fulfilment"
            label="Check payment methods"
            color="neutral"
            variant="soft"
          />
          <UButton
            to="/workspace/kitchen/orders"
            label="Open Incoming"
            color="neutral"
            variant="soft"
          />
        </div>
      </section>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { Kitchen } from '../../../models/kitchen.model'
import type { KitchenService } from '../../../models/service.model'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
import { serviceSetupSummary } from '../../../utils/service-setup-summary'
const props = defineProps<{
  kitchen: Kitchen
  name: string
  services: KitchenService[]
  menus: KitchenMenu[]
  menusOutcome: ReadOutcome
}>()
const entries = computed(() =>
  props.services.map((service) => ({
    service,
    summary: serviceSetupSummary(service, props.menus, props.menusOutcome),
  }))
)
const servicePath = (id: string) =>
  '/workspace/kitchen/orders/services/' + encodeURIComponent(id)
</script>
