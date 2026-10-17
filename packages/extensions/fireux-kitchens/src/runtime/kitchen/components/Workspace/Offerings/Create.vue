<template>
  <form class="grid gap-5" @submit.prevent="submit">
    <UFormField label="Offering name" required>
      <UInput
        v-model="name"
        placeholder="Picnic"
        maxlength="120"
        class="w-full"
        :disabled="busy || disabled"
      />
    </UFormField>
    <UFormField
      label="Earliest collection"
      :description="
        timing === 'next_day'
          ? 'Order today for collection from tomorrow, using the venue’s local calendar.'
          : 'Collection during the hours below.'
      "
      required
    >
      <USelect
        v-model="timing"
        :items="[
          { label: 'From tomorrow', value: 'next_day' },
          { label: 'Same day', value: 'same_day' },
        ]"
        class="w-full"
        :disabled="busy || disabled"
      />
    </UFormField>
    <MoleculesStateCard
      v-if="!['ready', 'empty'].includes(menusOutcome)"
      entity="Menus"
      :loading="menusOutcome !== 'error'"
      :state="menusOutcome === 'error' ? 'error' : undefined"
    />
    <UFormField v-else label="Menus" required>
      <UCheckboxGroup
        v-model="menuIds"
        :items="menuOptions"
        :disabled="busy || disabled"
      />
      <UButton
        to="/workspace/kitchen/menus/create"
        target="_blank"
        label="Create a menu"
        color="neutral"
        variant="link"
        class="mt-2"
      />
    </UFormField>
    <UFormField
      label="Collection hours"
      :description="
        timezone ? `Local time · ${timezone}` : 'Set the venue timezone first.'
      "
      required
    >
      <UButton
        v-if="venueHours?.windows.length"
        label="Use venue opening hours"
        color="neutral"
        variant="link"
        class="mb-2"
        :disabled="busy || disabled"
        @click="hoursText = formatWeekdayTimeText(venueHours)"
      />
      <UTextarea
        v-model="hoursText"
        :rows="5"
        placeholder="Tuesday - Sunday 06:30 - 23:00"
        class="w-full"
        :disabled="busy || disabled || !timezone"
      />
    </UFormField>
    <p class="text-sm text-muted">
      Created with availability off. Enable it after reviewing the menu and
      collection hours.
    </p>
    <MoleculesCopyError v-if="error" :message="error" />
    <UButton
      type="submit"
      label="Create offering"
      :loading="busy"
      :disabled="
        disabled ||
        !name.trim() ||
        !menuIds.length ||
        !hoursText.trim() ||
        !timezone ||
        !['ready', 'empty'].includes(menusOutcome)
      "
      class="justify-self-start"
    />
  </form>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import {
  formatWeekdayTimeText,
  parseWeekdayTimeText,
} from '../../../../utils/weekday-time'
import type { Menu } from '../../../../menu/models/menu.model'
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model'
const props = defineProps<{
  kitchenId: string
  active: boolean
  disabled: boolean
  menus: Menu[]
  menusOutcome: string
  timezone: string
  venueHours: WeekdayTimeWindowsConfig | null
  captureIntent: () => () => boolean
  save: (
    input: Record<string, unknown>,
    isCurrent?: () => boolean
  ) => Promise<unknown>
}>()
const emit = defineEmits<{ created: [id: string] }>()
const name = ref('')
const timing = ref<'next_day' | 'same_day'>('next_day')
const menuIds = ref<string[]>([])
const hoursText = ref(
  props.venueHours ? formatWeekdayTimeText(props.venueHours) : ''
)
const busy = ref(false),
  error = ref('')
const menuOptions = computed(() =>
  props.menus
    .filter(
      (menu) =>
        menu.status !== 'archived' &&
        menu.schedule !== 'daily' &&
        !menu.doc?.url
    )
    .map((menu) => ({ label: menu.name, value: menu.id }))
)
const captureSurface = useCommandScope([
  () => props.kitchenId,
  () => props.active,
])
async function submit() {
  if (busy.value || props.disabled || !props.active) return
  const currentSurface = captureSurface(),
    currentOwner = props.captureIntent()
  const isCurrent = () => currentSurface() && currentOwner()
  busy.value = true
  error.value = ''
  try {
    const hours = parseWeekdayTimeText(hoursText.value, props.timezone)
    if (!hours.windows.length) throw new Error('Add collection hours.')
    const result = (await props.save(
      {
        createSeparate: true,
        option: 'collection',
        name: name.value.trim(),
        menu_ids: [...menuIds.value],
        hours,
        enabled: false,
        collection_timing: timing.value,
        interactions: [
          {
            type: 'collection',
            changes: {
              enabled: true,
              asap_enabled: false,
              notice_hours: 0,
              slot_interval_minutes: 30,
              schedule_horizon_days: 7,
            },
          },
        ],
      },
      isCurrent
    )) as { offering: { id: string } }
    if (isCurrent()) emit('created', result.offering.id)
  } catch (cause) {
    if (isCurrent())
      error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
