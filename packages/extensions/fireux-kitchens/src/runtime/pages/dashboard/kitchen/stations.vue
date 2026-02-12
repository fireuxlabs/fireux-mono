<template>
  <UDashboardPanel id="dashboard-kitchen-stations">
    <template #header>
      <LayoutsDashboardNavbar title="Stations" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Stations board</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Station coverage for menus in the active runtime kitchen.
              </p>
            </div>
          </template>

          <div class="text-xs text-dimmed">{{ stationsOrganized.length }} stations</div>
        </UCard>

        <div v-if="stationsOrganized.length" class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="station in stationsOrganized"
            :key="station.id"
            class="rounded-md border border-default p-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ station.label }}</p>
                <p class="text-xs text-dimmed">
                  Menus: {{ station.menuCount }} · Active now: {{ station.activeMenuCount }}
                </p>
              </div>

              <div class="flex items-center gap-1 text-xs capitalize text-dimmed">
                <UChip :color="station.isActiveNow ? 'success' : 'error'" inset />
                <span>{{ station.isActiveNow ? 'active' : 'inactive' }}</span>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-dimmed">No stations yet.</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import KitchenCardsPill from '../../../components/organisms/Kitchen/Cards/Pill.vue'
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../composables/fireux/app/useRuntimeKitchen'
import { useKitchenMenuStackFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenMenuStackFetch'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenMenu } from '../../../models/menu.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-stations',
    label: 'Stations',
    icon: 'i-lucide-layout-grid',
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

type StationSummary = {
  id: string
  label: string
  menuCount: number
  activeMenuCount: number
  isActiveNow: boolean
}

const runtimeKitchen = useRuntimeKitchen()
const { pill: kitchenPillBuilder } = useKitchenInterface()
const { runtimeKitchenMode } = useRuntimeKitchenSelection()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))
const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const runtimeKitchenCollectionPath = computed(() =>
  runtimeKitchenMode.value === 'live' ? 'kitchens' : 'test-kitchens'
)
const { menus: firestoreMenus } = useKitchenMenuStackFetch(runtimeKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const dummyMenus = ref([...dummyKitchenScenario.menuStack.menus])

const menus = computed<KitchenMenu[]>(() =>
  runtimeKitchenMode.value === 'dummy'
    ? dummyMenus.value
    : [...(firestoreMenus.value ?? [])]
)

const menusOrganized = computed(() =>
  [...menus.value].sort((a, b) =>
    Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
    String(a.name || '').localeCompare(String(b.name || ''))
  )
)

const toDate = (value: unknown): Date | null => {
  if (!value) return null

  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const seconds = Number(record.seconds)
    if (Number.isFinite(seconds) && seconds > 0) return new Date(seconds * 1000)

    const maybeToDate = record.toDate
    if (typeof maybeToDate === 'function') {
      const parsed = maybeToDate.call(value)
      if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) return parsed
    }
  }

  return null
}

const isMenuActiveNow = (menu: KitchenMenu) => {
  if (!menu.active) return false

  const startsAt = toDate(menu.starts_at)
  const endsAt = toDate(menu.ends_at)
  const now = new Date().getTime()

  const isAfterStart = !startsAt || now >= startsAt.getTime()
  const isBeforeEnd = !endsAt || now <= endsAt.getTime()

  return isAfterStart && isBeforeEnd
}

const stationLabel = (id: string) =>
  String(id || '')
    .trim()
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Unknown'

const stationsOrganized = computed<StationSummary[]>(() => {
  const map = new Map<string, StationSummary>()

  for (const menu of menusOrganized.value) {
    const isActive = isMenuActiveNow(menu)
    const stationIds = Array.from(
      new Set(
        (Array.isArray(menu.stations) ? menu.stations : [])
          .map((value) => String(value || '').trim())
          .filter(Boolean)
      )
    )

    for (const id of stationIds) {
      const current = map.get(id) ?? {
        id,
        label: stationLabel(id),
        menuCount: 0,
        activeMenuCount: 0,
        isActiveNow: false,
      }

      current.menuCount += 1
      if (isActive) current.activeMenuCount += 1
      current.isActiveNow = current.activeMenuCount > 0
      map.set(id, current)
    }
  }

  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
})
</script>
