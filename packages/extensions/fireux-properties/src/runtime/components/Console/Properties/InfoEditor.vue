<template>
  <section class="space-y-4">
    <UAlert
      v-if="!selectedProperty"
      color="neutral"
      variant="soft"
      title="Select a property"
      description="Choose a live property, test property or simulation before editing this section."
    />

    <form v-else class="space-y-5" @submit.prevent="save">
      <DevFireuxDebugPanel
        v-if="isDev"
        title="Property section"
        scope="console"
        :data="debug"
      />

      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <UIcon :name="draft.icon" class="size-5 text-primary" />
          <h2 class="text-lg font-semibold text-highlighted">
            {{ draft.title }}
          </h2>
        </div>
        <p class="text-sm text-muted">
          {{ draft.summary }}
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div
          v-for="field in draft.fields"
          :key="field.key"
        >
          <UFormField :label="field.label">
            <UTextarea
              v-if="field.type === 'textarea'"
              v-model="field.value"
              :placeholder="field.placeholder"
              :rows="3"
            />
            <UInput
              v-else
              v-model="field.value"
              :placeholder="field.placeholder"
            />
          </UFormField>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UButton type="submit" color="primary" icon="i-lucide-save">
          Save
        </UButton>
        <p v-if="savedMessage" class="text-sm text-muted">
          {{ savedMessage }}
        </p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { usePropertyConsoleIndex } from '../../../composables/fireux/console/property/usePropertyConsoleIndex'

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

type PropertyInfoField = {
  key: string
  label: string
  value: string
  placeholder?: string
  type?: 'text' | 'textarea'
}

type PropertyInfoPage = {
  key: PropertyInfoPageKey
  title: string
  description: string
  icon: string
  summary: string
  fields: PropertyInfoField[]
}

const props = defineProps<{
  pageKey: PropertyInfoPageKey
}>()

const pageDefaults: Record<PropertyInfoPageKey, PropertyInfoPage> = {
  welcome: {
    key: 'welcome',
    title: 'Welcome',
    description: 'Arrival note, Wi-Fi, host contact and first steps.',
    icon: 'i-lucide-hand-heart',
    summary: 'Key arrival information guests need first.',
    fields: [
      field('welcome_note', 'Welcome note', 'Welcome to the Penthouse Holiday Apartment.', 'textarea'),
      field('manager', 'Manager', 'Apartment Manager Natalie'),
      field('phone', 'Phone', '+41 78 604 69 00'),
      field('email', 'Email', 'bookwithnats@gmail.com'),
      field('address', 'Address', 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken', 'textarea'),
      field('wifi_network', 'Wi-Fi network', 'Penthouse'),
      field('wifi_password', 'Wi-Fi password', 'penthouse2020'),
    ],
  },
  'check-in': {
    key: 'check-in',
    title: 'Check-in',
    description: 'Arrival time, access, keys, parking on arrival and settling-in instructions.',
    icon: 'i-lucide-key-round',
    summary: 'How guests arrive and get settled.',
    fields: [
      field('check_in_time', 'Check-in time', 'Needs host confirmation'),
      field('arrival_steps', 'Arrival steps', 'Needs exact arrival and building entry steps', 'textarea'),
      field('key_safe', 'Key safe', 'Guests can use the key safe box when going out.', 'textarea'),
      field('key_safe_location', 'Key safe location', 'Needs exact key safe location', 'textarea'),
      field('key_safe_code', 'Key safe code', '2020'),
      field('key_safe_warning', 'Key safe warning', 'Never change the code.'),
    ],
  },
  checkout: {
    key: 'checkout',
    title: 'Checkout',
    description: 'Departure time, dishes, rubbish, key return and final checks.',
    icon: 'i-lucide-door-open',
    summary: 'What guests should do before leaving.',
    fields: [
      field('checkout_time', 'Checkout time', '10:00 unless agreed otherwise.'),
      field('dishes', 'Dishes', 'Put leftover dishes in the dishwasher and start the cleaning cycle.', 'textarea'),
      field('key_return', 'Key return', 'Return the key where you found it. Exact instruction needs confirmation.', 'textarea'),
      field('tidy_state', 'Tidy state', 'Leave the apartment in the same tidy manner that you found it.', 'textarea'),
      field('final_checks', 'Final checks', 'Turn heating off and close windows and doors before leaving.', 'textarea'),
      field('charges', 'Charges', 'Extra cleaning or damage caused by neglect may be charged.', 'textarea'),
    ],
  },
  emergency: {
    key: 'emergency',
    title: 'Emergency',
    description: 'Urgent numbers, medical help, host escalation and safety equipment.',
    icon: 'i-lucide-siren',
    summary: 'Urgent help and safety information.',
    fields: [
      field('police', 'Police', '117'),
      field('fire', 'Fire Department', '118'),
      field('ambulance', 'Ambulance', '144'),
      field('helicopter_rescue', 'Helicopter Rescue', '1414'),
      field('hospital', 'Interlaken Hospital', '+41 (0) 33 826 25 00, Weissenaustrasse 27, 3800 Interlaken', 'textarea'),
      field('first_aid', 'First aid kit', 'Kitchen drawer to the right of the microwave.'),
      field('walk_in_clinic', 'Walk-in clinic', 'Interlaken West train station, Bahnhofstrasse 28, 3800 Interlaken. Mon-Fri 08:00-12:00 and 13:00-18:00.', 'textarea'),
      field('hani_emergency', 'HANI Emergency', 'Interlaken Hospital, Weissenaustrasse 27, 3800 Unterseen. Out-of-hours medical service.', 'textarea'),
      field('fire_equipment', 'Fire equipment', 'Smoke alarms are fitted. Fire extinguisher by the downstairs main entrance. Fire blanket under the kitchen sink.', 'textarea'),
    ],
  },
  'house-rules': {
    key: 'house-rules',
    title: 'House Rules',
    description: 'Noise, smoking, windows, neighbour respect, damage notes and stay rules.',
    icon: 'i-lucide-clipboard-check',
    summary: 'Important rules for a smooth stay.',
    fields: [
      field('quiet_hours', 'Quiet hours', 'No loud noise after 22:00. Leave the balcony by 22:00 because noise travels.', 'textarea'),
      field('smoking', 'Smoking', 'This is a non-smoking apartment. Smoking is only allowed on the balcony using the ashtray.', 'textarea'),
      field('windows_doors', 'Windows and doors', 'Close all windows and doors before going out.', 'textarea'),
      field('bathrooms', 'Bathrooms', 'Bathrooms are not wet rooms. Mop up water from floors to prevent leaks and damage.', 'textarea'),
      field('beds_sofa', 'Beds and sofa', 'Do not eat in bed or on the sofa because stains are difficult to remove.', 'textarea'),
      field('damage_notes', 'Damage notes', 'Water damage caused by rain, extra cleaning or damage caused by neglect may be charged.', 'textarea'),
    ],
  },
  'apartment-guide': {
    key: 'apartment-guide',
    title: 'Apartment Guide',
    description: 'Heating, appliances, TV, chargers, tap water, bathroom notes, laundry and balcony details.',
    icon: 'i-lucide-info',
    summary: 'Useful instructions for the property.',
    fields: [
      field('heating', 'Heating', 'Radiators have dials from 1 to 5. Do not put heating on high and open windows. Turn heating off on departure.', 'textarea'),
      field('dishwasher', 'Dishwasher', 'Select a program, add a dishwasher tab, then press start. Never put washing-up liquid in the dishwasher.', 'textarea'),
      field('chargers', 'Chargers', 'USB chargers are supplied. Do not take or move installed chargers.'),
      field('games_books', 'Games and books', 'Adult and children board games and books are available. Please treat them with respect.', 'textarea'),
      field('iron_board', 'Iron and ironing board', 'The ironing board is on the landing between the two bedrooms.'),
      field('tv', 'TV', 'Cable TV and DVDs are available.'),
      field('tap_water', 'Tap water', 'Tap water is 100% drinkable.'),
    ],
  },
  'rubbish-recycling': {
    key: 'rubbish-recycling',
    title: 'Rubbish & Recycling',
    description: 'Bags, bins, recycling location, collection notes and what not to put where.',
    icon: 'i-lucide-recycle',
    summary: 'How guests should handle rubbish and recycling.',
    fields: [
      field('rubbish_bags', 'Rubbish bags', 'Use the white AVAG bags provided under the sink.'),
      field('main_bin', 'Main bin', 'Put full bags in the grey container outside by visitor parking. Use the key to unlock the padlock.', 'textarea'),
      field('recycling', 'Recycling', 'The recycling container is on the balcony. Cardboard can go in recycling.', 'textarea'),
      field('not_allowed', 'Do not recycle', 'Do not put general garbage or food containers in recycling.'),
    ],
  },
  parking: {
    key: 'parking',
    title: 'Parking',
    description: 'Visitor parking, garage or bay details, access notes and places guests must avoid.',
    icon: 'i-lucide-car',
    summary: 'Where guests can park.',
    fields: [
      field('parking_location', 'Parking location', 'Underground parking is available. Bay number or garage access details need confirmation.', 'textarea'),
      field('visitor_parking', 'Visitor parking', 'Temporary visitor parking is to the right of the main entrance.'),
      field('avoid', 'Avoid', 'Do not leave the car engine running unnecessarily.'),
    ],
  },
  'local-guide': {
    key: 'local-guide',
    title: 'Local Guide',
    description: 'Shops, transport, taxis, bike rentals, restaurants, things to do and useful nearby places.',
    icon: 'i-lucide-map-pin',
    summary: 'Nearby places and local recommendations.',
    fields: [
      field('shops', 'Shops', 'CO-OP supermarket is downstairs and open Mon-Sun 08:00-20:00. Lidl is open daily 08:00-21:00.', 'textarea'),
      field('post_office', 'Post Office', 'The Post Office is inside the CO-OP supermarket.'),
      field('transport', 'Transport', 'The bus stop is on the main street by Tells restaurant. Use buses 104 and 105 for local connections.', 'textarea'),
      field('taxis', 'Taxis', 'Bahnhof Taxi: +41 (0) 33 822 50 50. A Taxi: +41 (0) 33 822 60 60.', 'textarea'),
      field('bike_rentals', 'Bike rentals', 'Amacher Bike Shop rents electric bikes. Daniels Fun Rentals offers mountain bikes, scooters, ATVs, funcars, e-bikeboards and quads.', 'textarea'),
      field('walking_west', 'Walking to Interlaken West', 'Walk left from the apartment, through the alley, then continue towards the main Interlaken high street and West station.', 'textarea'),
      field('walking_ost', 'Walking to Interlaken Ost', 'Walk right from the apartment, left at the end of the road, over the roundabout and continue towards Ost station.', 'textarea'),
      field('recommendations', 'Recommendations', 'Restaurant and things-to-do recommendations need host confirmation.', 'textarea'),
    ],
  },
  updates: {
    key: 'updates',
    title: 'Updates',
    description: 'Temporary guest notices such as access changes, roadworks, broken appliances or weather notes.',
    icon: 'i-lucide-megaphone',
    summary: 'Current notices for guests.',
    fields: [
      field('current_notice', 'Current notice', 'No current guest notices.'),
      field('starts', 'Starts', ''),
      field('expires', 'Expires', ''),
    ],
  },
}

const toast = useToastify()
const {
  selectedProperty,
  selectedMode,
  propertyId,
  debug: consoleDebug,
} = usePropertyConsoleIndex()
const draft = ref(clonePage(pageDefaults[props.pageKey]))
const savedMessage = ref('')
const isDev = import.meta.dev

const debug = computed(() => ({
  pageKey: props.pageKey,
  selectedMode: selectedMode.value,
  propertyId: propertyId.value,
  selectedProperty: selectedProperty.value,
  draft: draft.value,
  console: consoleDebug.value,
  persistence: 'scaffold draft only; Firestore property info pages are not wired yet',
}))

watch(
  () => props.pageKey,
  () => resetDraft(),
  { immediate: true }
)

function field(
  key: string,
  label: string,
  value: string,
  type: PropertyInfoField['type'] = 'text',
  placeholder = ''
): PropertyInfoField {
  return { key, label, value, type, placeholder }
}

function clonePage(page: PropertyInfoPage): PropertyInfoPage {
  return {
    ...page,
    fields: page.fields.map((item) => ({ ...item })),
  }
}

function resetDraft() {
  draft.value = clonePage(pageDefaults[props.pageKey])
  savedMessage.value = ''
}

function save() {
  savedMessage.value = 'Saved in this console draft.'
  toast.success('Property section saved')
}
</script>
