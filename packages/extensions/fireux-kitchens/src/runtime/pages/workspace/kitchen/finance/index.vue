<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-finance">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Finance">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="finance"
          /></template>
        </LayoutsWorkspaceNavbar>

        <UDashboardToolbar>
          <template #left>
            <UFieldGroup size="sm" aria-label="Finance report period">
              <UButton
                v-for="option in presetOptions"
                :key="option.value"
                :label="option.label"
                color="neutral"
                :variant="selectedPreset === option.value ? 'solid' : 'ghost'"
                :aria-pressed="selectedPreset === option.value"
                @click="selectPreset(option.value)"
              />
            </UFieldGroup>
          </template>

          <template #right>
            <UBadge
              v-if="isDemo && simulationDate"
              color="success"
              variant="solid"
              icon="i-lucide-flask-conical"
            >
              Simulation date · Today: {{ formatIsoDate(simulationDate) }}
            </UBadge>

            <UPopover>
              <UButton
                :label="selectedPeriodLabel"
                icon="i-lucide-calendar-range"
                color="neutral"
                variant="outline"
              />

              <template #content>
                <UCalendar
                  :model-value="calendarRange"
                  :max-value="todayDate"
                  class="p-2"
                  range
                  @update:model-value="selectCalendarRange"
                />
              </template>
            </UPopover>
          </template>
        </UDashboardToolbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="finance" />
          <WorkspaceKitchenCapabilityAI operation="finance" />
          <WorkspaceKitchenCapabilityView operation="finance" />
          <WorkspaceKitchenFinanceNav />
          <WorkspaceKitchenFinanceOverview
            :from-date="calendarRange.start.toString()"
            :to-date="calendarRange.end.toString()"
          />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="finance" />
          <WorkspaceKitchenResearchSegue
            capability="Sales"
            base-path="/workspace/kitchen/finance/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  type DateValue,
} from '@internationalized/date'
import { computed, ref, watch } from 'vue'
import {
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../../../../kitchen/composables/workspace/core/useKitchenWorkspaceDemoData'
import { useKitchenWorkspace } from '../../../../kitchen/composables/workspace/core/useKitchenWorkspace'

type Preset = 'today' | 'week' | 'month' | '90-days' | 'custom'
type CalendarRangeValue = {
  start?: DateValue | null
  end?: DateValue | null
}

const presetOptions: { value: Exclude<Preset, 'custom'>; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: '90-days', label: 'Last 90 days' },
]
const { selection } = useKitchenWorkspace()
const isDemo = computed(() => selection.kitchenSource.value === 'demo')
const demoData = useKitchenWorkspaceDemoData(isDemo)
const demoScenario = computed(() =>
  findKitchenWorkspaceDemoScenario(
    demoData.data.value,
    selection.kitchenId.value
  )
)
const simulationDate = computed(
  () => demoScenario.value?.finance?.asOfDate ?? ''
)
const realToday = new Date()
const resolvedToday = computed(() =>
  isDemo.value && simulationDate.value
    ? calendarDateFromIso(simulationDate.value)
    : new CalendarDate(
        realToday.getFullYear(),
        realToday.getMonth() + 1,
        realToday.getDate()
      )
)
const todayDate = computed(() => resolvedToday.value)
const selectedPreset = ref<Preset>('today')
const calendarRange = ref({
  start: resolvedToday.value,
  end: resolvedToday.value,
})
const dateFormatter = new DateFormatter('en-GB', { dateStyle: 'medium' })
const selectedPeriodLabel = computed(() => {
  const start = calendarRange.value.start
  const end = calendarRange.value.end
  const startLabel = dateFormatter.format(start.toDate(getLocalTimeZone()))
  if (start.compare(end) === 0) return startLabel
  return `${startLabel} – ${dateFormatter.format(end.toDate(getLocalTimeZone()))}`
})

function selectPreset(preset: Exclude<Preset, 'custom'>) {
  selectedPreset.value = preset
  const end = resolvedToday.value
  const endDate = end.toDate(getLocalTimeZone())
  if (preset === 'today') {
    calendarRange.value = { start: end, end }
    return
  }
  if (preset === 'week') {
    const daysSinceMonday = (endDate.getDay() + 6) % 7
    calendarRange.value = {
      start: end.subtract({ days: daysSinceMonday }),
      end,
    }
    return
  }
  if (preset === 'month') {
    calendarRange.value = {
      start: new CalendarDate(end.year, end.month, 1),
      end,
    }
    return
  }
  calendarRange.value = { start: end.subtract({ days: 89 }), end }
}

watch(resolvedToday, () => {
  if (selectedPreset.value === 'custom') return
  selectPreset(selectedPreset.value)
})

function calendarDateFromIso(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new CalendarDate(year, month, day)
}

function formatIsoDate(value: string) {
  return dateFormatter.format(
    calendarDateFromIso(value).toDate(getLocalTimeZone())
  )
}

function selectCalendarRange(value: unknown) {
  const range = value as CalendarRangeValue | null
  if (!range?.start) return
  const end = range.end ?? range.start
  if (end.compare(range.start) > 92) return
  calendarRange.value = {
    start: range.start as CalendarDate,
    end: end as CalendarDate,
  }
  selectedPreset.value = 'custom'
}

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-finance',
    label: 'Sales',
    group: 'Reports',
    icon: 'i-lucide-chart-column',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
