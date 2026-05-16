<template>
  <section class="space-y-4">
    <UAlert
      v-if="!selectedProperty"
      color="neutral"
      variant="soft"
      title="Select a property"
      description="Choose a live property, test property or simulation before editing this section."
    />

    <template v-else>
      <PropertyCardsPill
        v-if="selectedPropertyCard"
        v-bind="selectedPropertyCard"
        :link="false"
        :show-badges="false"
      />

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <UIcon :name="page.icon" class="size-5 text-primary" />
                <h2 class="text-xl font-semibold text-highlighted">
                  {{ page.title }}
                </h2>
              </div>
              <p class="text-sm text-muted">
                {{ page.description }}
              </p>
            </div>
            <UBadge color="neutral" variant="soft">
              {{ selectedModeLabel }}
            </UBadge>
          </div>
        </template>

        <form class="space-y-5" @submit.prevent="save">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Title">
              <UInput v-model="draft.title" />
            </UFormField>
            <UFormField label="Section key">
              <UInput :model-value="page.key" disabled />
            </UFormField>
          </div>

          <UFormField label="Summary">
            <UTextarea v-model="draft.summary" :rows="3" />
          </UFormField>

          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h3 class="font-semibold text-highlighted">
                Information rows
              </h3>
              <UButton
                type="button"
                color="neutral"
                variant="soft"
                icon="i-lucide-plus"
                @click="addItem"
              >
                Add row
              </UButton>
            </div>

            <UCard
              v-for="(item, index) in draft.items"
              :key="item.id"
              variant="subtle"
            >
              <div class="grid gap-3 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.5fr)_10rem_auto] lg:items-end">
                <UFormField label="Label">
                  <UInput v-model="item.label" placeholder="Label" />
                </UFormField>
                <UFormField label="Value">
                  <UTextarea v-model="item.value" placeholder="Information" :rows="2" />
                </UFormField>
                <UFormField label="Tone">
                  <USelect v-model="item.tone" :items="toneOptions" />
                </UFormField>
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  aria-label="Remove row"
                  @click="removeItem(index)"
                />
              </div>
            </UCard>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <UButton type="submit" color="primary" icon="i-lucide-save">
              Save section
            </UButton>
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              icon="i-lucide-rotate-ccw"
              @click="resetDraft"
            >
              Reset
            </UButton>
            <p v-if="savedMessage" class="text-sm text-muted">
              {{ savedMessage }}
            </p>
          </div>
        </form>
      </UCard>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { resolveConsoleModeLabel } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { usePropertyConsoleIndex } from '../../../../composables/fireux/app/property-console/usePropertyConsoleIndex'
import { usePropertyInterface } from '../../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'

type PropertyInfoPageKey =
  | 'welcome'
  | 'check-in'
  | 'checkout'
  | 'emergency'
  | 'house-rules'
  | 'apartment-guide'
  | 'rubbish-recycling'
  | 'parking'
  | 'local-guide'
  | 'updates'

type PropertyInfoTone = 'default' | 'important' | 'warning'

type PropertyInfoItem = {
  id: string
  label: string
  value: string
  tone: PropertyInfoTone
}

type PropertyInfoPage = {
  key: PropertyInfoPageKey
  title: string
  description: string
  icon: string
  summary: string
  items: PropertyInfoItem[]
}

const props = defineProps<{
  pageKey: PropertyInfoPageKey
}>()

const toneOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Important', value: 'important' },
  { label: 'Warning', value: 'warning' },
] as const

const pageDefaults: Record<PropertyInfoPageKey, PropertyInfoPage> = {
  welcome: {
    key: 'welcome',
    title: 'Welcome',
    description: 'Arrival note, Wi-Fi, host contact and first steps.',
    icon: 'i-lucide-hand-heart',
    summary: 'Key arrival information guests need first.',
    items: [
      row('welcome-note', 'Welcome note', 'Welcome to the property.'),
      row('wifi', 'Wi-Fi', 'Add the network name and password.', 'important'),
      row('host-contact', 'Host contact', 'Add the preferred guest contact method.'),
    ],
  },
  'check-in': {
    key: 'check-in',
    title: 'Check-in',
    description: 'Arrival time, access, keys, parking on arrival and settling-in instructions.',
    icon: 'i-lucide-key-round',
    summary: 'How guests arrive and get settled.',
    items: [
      row('arrival-time', 'Arrival time', 'Add the check-in time.', 'important'),
      row('access', 'Access', 'Add building entry and access notes.'),
      row('keys', 'Keys', 'Add key or lockbox instructions.'),
    ],
  },
  checkout: {
    key: 'checkout',
    title: 'Checkout',
    description: 'Departure time, dishes, rubbish, key return and final checks.',
    icon: 'i-lucide-door-open',
    summary: 'What guests should do before leaving.',
    items: [
      row('departure-time', 'Departure time', 'Add the checkout time.', 'important'),
      row('dishes', 'Dishes', 'Add dish or dishwasher instructions.'),
      row('keys', 'Key return', 'Add where guests should leave the key.'),
    ],
  },
  emergency: {
    key: 'emergency',
    title: 'Emergency',
    description: 'Urgent numbers, medical help, host escalation and safety equipment.',
    icon: 'i-lucide-siren',
    summary: 'Urgent help and safety information.',
    items: [
      row('emergency-number', 'Emergency services', 'Add the main emergency number.', 'important'),
      row('host-urgent', 'Urgent host contact', 'Add urgent host contact instructions.', 'important'),
      row('first-aid', 'First aid', 'Add first aid kit location.'),
    ],
  },
  'house-rules': {
    key: 'house-rules',
    title: 'House Rules',
    description: 'Noise, smoking, windows, neighbour respect, damage notes and stay rules.',
    icon: 'i-lucide-clipboard-check',
    summary: 'Important rules for a smooth stay.',
    items: [
      row('quiet-hours', 'Quiet hours', 'Add quiet hour guidance.'),
      row('smoking', 'Smoking', 'Add smoking rules.', 'warning'),
      row('windows', 'Windows and doors', 'Add closing or safety instructions.'),
    ],
  },
  'apartment-guide': {
    key: 'apartment-guide',
    title: 'Apartment Guide',
    description: 'Heating, appliances, TV, chargers, tap water, bathroom notes, laundry and balcony details.',
    icon: 'i-lucide-info',
    summary: 'Useful instructions for the property.',
    items: [
      row('heating', 'Heating', 'Add heating or air con instructions.'),
      row('appliances', 'Appliances', 'Add appliance notes.'),
      row('tv', 'TV and streaming', 'Add TV or streaming instructions.'),
    ],
  },
  'rubbish-recycling': {
    key: 'rubbish-recycling',
    title: 'Rubbish & Recycling',
    description: 'Bags, bins, recycling location, collection notes and what not to put where.',
    icon: 'i-lucide-recycle',
    summary: 'How guests should handle rubbish and recycling.',
    items: [
      row('rubbish', 'Rubbish', 'Add rubbish bag or bin instructions.'),
      row('recycling', 'Recycling', 'Add recycling location and rules.'),
      row('collection', 'Collection', 'Add collection or drop-off notes.'),
    ],
  },
  parking: {
    key: 'parking',
    title: 'Parking',
    description: 'Visitor parking, garage or bay details, access notes and places guests must avoid.',
    icon: 'i-lucide-car',
    summary: 'Where guests can park.',
    items: [
      row('parking-location', 'Parking location', 'Add where guests should park.', 'important'),
      row('garage-access', 'Garage access', 'Add garage or bay access details.'),
      row('avoid', 'Avoid', 'Add places guests must not park.', 'warning'),
    ],
  },
  'local-guide': {
    key: 'local-guide',
    title: 'Local Guide',
    description: 'Shops, transport, taxis, bike rentals, restaurants, things to do and useful nearby places.',
    icon: 'i-lucide-map-pin',
    summary: 'Nearby places and local recommendations.',
    items: [
      row('shops', 'Shops', 'Add nearby shops.'),
      row('transport', 'Transport', 'Add transport notes.'),
      row('recommendations', 'Recommendations', 'Add personal recommendations.'),
    ],
  },
  updates: {
    key: 'updates',
    title: 'Updates',
    description: 'Temporary guest notices such as access changes, roadworks, broken appliances or weather notes.',
    icon: 'i-lucide-megaphone',
    summary: 'Current notices for guests.',
    items: [
      row('notice', 'Notice', 'Add a current guest notice.', 'important'),
      row('expires', 'Expires', 'Add when this update stops applying.'),
    ],
  },
}

const toast = useToastify()
const { selectedProperty, selectedMode } = usePropertyConsoleIndex()
const { pill } = usePropertyInterface()
const draft = ref(clonePage(pageDefaults[props.pageKey]))
const savedMessage = ref('')

const page = computed(() => pageDefaults[props.pageKey])
const selectedModeLabel = computed(() => resolveConsoleModeLabel(selectedMode.value))
const selectedPropertyCard = computed(() => pill(selectedProperty.value))

watch(
  () => props.pageKey,
  () => resetDraft(),
  { immediate: true }
)

function row(
  id: string,
  label: string,
  value: string,
  tone: PropertyInfoTone = 'default'
): PropertyInfoItem {
  return { id, label, value, tone }
}

function clonePage(page: PropertyInfoPage): PropertyInfoPage {
  return {
    ...page,
    items: page.items.map((item) => ({ ...item })),
  }
}

function resetDraft() {
  draft.value = clonePage(pageDefaults[props.pageKey])
  savedMessage.value = ''
}

function addItem() {
  draft.value.items.push(row(`row-${Date.now()}`, '', ''))
}

function removeItem(index: number) {
  draft.value.items.splice(index, 1)
}

function save() {
  savedMessage.value = 'Saved in this console draft.'
  toast.success('Property section saved')
}
</script>
