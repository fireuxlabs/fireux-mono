<template>
  <section class="workspace-surface">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <UPageHeader
        title="Services"
        description="What your Kitchen offers, and how guests use it."
      />
      <UButton
        v-if="selectedKitchen && canWrite"
        label="Create service"
        icon="i-lucide-plus"
        @click="creating = !creating"
      />
    </div>
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
      <UCard v-if="creating">
        <form
          class="flex flex-wrap items-end gap-3"
          @submit.prevent="createService"
        >
          <UFormField label="Service name" required class="min-w-0 flex-1">
            <UInput
              v-model="name"
              placeholder="Breakfast, lunch, dinner…"
              required
              maxlength="120"
              :disabled="busy"
              class="w-full"
            />
          </UFormField>
          <UButton
            type="submit"
            label="Create service"
            :loading="busy"
            :disabled="!name.trim() || !canWrite"
          />
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="busy"
            @click="creating = false"
          />
        </form>
        <p class="mt-3 text-sm text-muted">
          New services start off. Add Menus, serving hours and guest
          interactions before enabling.
        </p>
        <UAlert
          v-if="error"
          :description="error"
          title="Could not create service"
          color="error"
          class="mt-3"
          ><template #actions><MoleculesCopyError :message="error" /></template
        ></UAlert>
      </UCard>
      <p v-if="!services.length" class="text-muted">
        No services yet. Create an offering such as Breakfast or Dinner.
      </p>
      <div v-else class="grid gap-4 md:grid-cols-2">
        <UCard v-for="service in services" :key="service.id">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 space-y-2">
              <h2 class="font-semibold break-words">{{ service.name }}</h2>
              <UBadge
                :color="service.enabled ? 'success' : 'neutral'"
                variant="subtle"
                >{{ service.enabled ? 'Enabled' : 'Off' }}</UBadge
              >
              <p class="text-sm text-muted">
                {{ service.menu_ids.length }} Menus ·
                {{ interactionSummary(service) }}
              </p>
            </div>
            <UButton
              :to="
                '/workspace/kitchen/orders/services/' +
                encodeURIComponent(service.id)
              "
              :aria-label="'Configure ' + service.name"
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
            />
          </div>
        </UCard>
      </div>
    </template>
    <UAlert v-else title="Choose a Kitchen to configure services" />
    <div class="flex flex-wrap gap-3">
      <UButton
        to="/workspace/kitchen/fulfilment"
        label="Delivery zones & payments"
        color="neutral"
        variant="outline"
      />
      <UButton
        to="/workspace/kitchen/channels"
        label="Channels"
        color="neutral"
        variant="outline"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenServices } from '../../../composables/workspace/services/useKitchenServices'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
import type { KitchenService } from '../../../models/service.model'
const { selectedKitchen, outcome, services, canWrite, create } =
  useKitchenServices()
const creating = ref(false),
  busy = ref(false),
  name = ref(''),
  error = ref('')
function interactionSummary(service: KitchenService) {
  return (
    service.interactions
      .filter((row) => row.enabled)
      .map((row) =>
        row.type === 'browse' ? 'Browse' : kitchenOrderTypeLabel(row.type)
      )
      .join(', ') || 'No interactions enabled'
  )
}
async function createService() {
  if (busy.value || !name.value.trim() || !canWrite.value) return
  busy.value = true
  error.value = ''
  try {
    await create(name.value.trim())
    creating.value = false
    name.value = ''
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Please try again.'
  } finally {
    busy.value = false
  }
}
</script>
