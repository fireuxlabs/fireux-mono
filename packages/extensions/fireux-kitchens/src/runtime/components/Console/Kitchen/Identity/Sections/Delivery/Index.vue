<template>
  <MoleculesDisclosurePanel
    title="Delivery"
    description="Zones, minimum orders, and delivery fees."
    icon="i-lucide-truck"
    :default-open="false"
  >
    <UCard class="mt-4">
      <div class="space-y-4">
        <UPageCard
          v-if="!zones.length"
          title="Add your first delivery area"
          description="Choose a radius, postcode, or polygon below."
          variant="subtle"
        />

        <!-- Reuse the public fulfilment map so console and customer routes show the same delivery truth. -->
        <KitchenDetailDeliveryZonesMap
          v-if="mapZones.length"
          :key="mapPreviewKey"
          class="delivery-zone-map-preview"
          :zones="mapZones"
          :currency-code="currencyCode"
          :center="deliveryCenter"
          :can-edit="canWrite"
          :editable-mode="activeBoundaryMode"
          :editable-zone-index="activeZoneIndex"
          @polygon-point="addPolygonPoint"
        />

        <div
          v-for="(zone, index) in zones"
          :key="zone.key"
          class="delivery-zone-panel"
          :class="{
            'delivery-zone-panel--active': activeZoneIndex === Number(index),
          }"
          :style="zoneCardStyle(Number(index))"
          @click="setActiveZoneIndex(index)"
          @focusin="setActiveZoneIndex(index)"
        >
          <div class="delivery-zone-panel__header">
            <div class="delivery-zone-panel__name">
              <UInput
                v-model="zone.label"
                :disabled="!canWrite"
                :placeholder="zonePlaceholder(index)"
              />
            </div>

            <div class="delivery-zone-panel__actions">
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-trash-2"
                aria-label="Remove zone"
                :disabled="!canWrite"
                @click="removeZone(index)"
              />
            </div>
          </div>

          <div class="delivery-zone-row">
            <UFormField class="delivery-zone-row__money" label="Minimum order">
              <UInput
                v-model="zone.min_order_chf"
                type="number"
                min="0"
                step="0.5"
                :disabled="!canWrite"
              />
            </UFormField>

            <span class="delivery-zone-row__plus">+</span>

            <UFormField class="delivery-zone-row__money" label="Fee">
              <UInput
                v-model="zone.fee_chf"
                type="number"
                min="0"
                step="0.5"
                :disabled="!canWrite"
              />
            </UFormField>

            <UFormField label="Boundary type">
              <URadioGroup
                v-model="zone.boundary_type"
                :items="boundaryTypeOptions"
                :disabled="!canWrite"
              />
            </UFormField>

            <UFormField
              v-if="zone.boundary_type === 'radius'"
              class="delivery-zone-row__boundary"
              label="Radius (m)"
            >
              <UInput
                v-model="zone.radius_m"
                type="number"
                min="0"
                step="100"
                :disabled="!canWrite"
                placeholder="1500"
              />
            </UFormField>

            <UFormField
              v-if="zone.boundary_type === 'postal_codes'"
              class="delivery-zone-row__boundary"
              label="Postcode(s)"
            >
              <UInput
                v-model="zone.postal_codes"
                :disabled="!canWrite"
                placeholder="3852, 3800"
              />
            </UFormField>

            <UFormField
              v-if="zone.boundary_type === 'polygon'"
              class="delivery-zone-row__boundary"
              label="Polygon points"
            >
              <UTextarea
                v-model="zone.polygon"
                :rows="2"
                :disabled="!canWrite"
                placeholder="46.765, 7.975"
              />
            </UFormField>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-plus"
            :disabled="!canWrite || zones.length >= maxZones"
            @click="addZone"
          >
            {{ zones.length >= maxZones ? '4 zones max' : 'Add zone' }}
          </UButton>

          <div class="flex items-center gap-2">
            <span v-if="saveState" class="text-xs text-dimmed">
              {{ saveState }}
            </span>

            <UButton
              color="primary"
              icon="i-lucide-save"
              :loading="saving"
              :disabled="!canWrite || saving"
              @click="save"
            >
              Save delivery zones
            </UButton>
          </div>
        </div>
      </div>
    </UCard>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useKitchenDeliveryEditor } from './useKitchenDeliveryEditor'
const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()
const {
  zoneColors,
  maxZones,
  boundaryTypeOptions,
  collectionPath,
  updateKitchen,
  place,
  currencyCode,
  toast,
  zones,
  activeZoneIndex,
  saving,
  saveState,
  syncingSavedZones,
  fulfilment,
  deliveryZones,
  paymentMethods,
  deliveryCenter,
  text,
  numberText,
  numberValue,
  compactList,
  polygonText,
  parsePolygon,
  editableZone,
  zoneBoundaryType,
  zonePlaceholder,
  zoneId,
  zoneColor,
  zoneCardStyle,
  mapZone,
  mapZones,
  activeZone,
  activeBoundaryMode,
  mapPreviewKey,
  normalizedZone,
  addZone,
  setActiveZoneIndex,
  addPolygonPoint,
  removeZone,
  save,
  persistDeliveryZones,
} = useKitchenDeliveryEditor(props)
</script>

<style scoped src="./delivery-editor.css"></style>
