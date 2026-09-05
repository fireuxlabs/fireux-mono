<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-calendar">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Calendar" />
      </template>

      <template #body>
        <WorkspaceFreemium
          family="kitchen"
          capability="calendar"
          page-label="Calendar"
          placement="top"
        />
        <section class="mx-auto grid w-full max-w-5xl gap-8 py-2">
          <header class="grid gap-3 border-b border-default pb-8">
            <p
              class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
            >
              Calendar
            </p>
            <h1 class="m-0 text-3xl font-semibold text-highlighted">
              {{ selectedDateLabel }}
            </h1>
            <p class="m-0 max-w-3xl text-base text-muted">
              Open the Kitchen capability that owns the work for this date.
              Calendar starts on today and can move through time without copying
              operational authority.
            </p>
            <div class="flex flex-wrap items-center gap-2 pt-2">
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral"
                variant="soft"
                aria-label="Previous day"
                @click="moveDay(-1)"
              />
              <UInput
                v-model="selectedDate"
                type="date"
                aria-label="Calendar date"
                class="w-44"
              />
              <UButton
                icon="i-lucide-chevron-right"
                color="neutral"
                variant="soft"
                aria-label="Next day"
                @click="moveDay(1)"
              />
              <UButton
                v-if="selectedDate !== todayKey"
                color="neutral"
                variant="ghost"
                @click="showToday"
              >
                Today
              </UButton>
            </div>
          </header>

          <section
            v-for="group in demand.doorwayGroups"
            :key="group.title"
            class="grid gap-3"
          >
            <h2 class="m-0 text-lg font-semibold text-highlighted">
              {{ group.title }}
            </h2>
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <UButton
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                color="neutral"
                variant="soft"
                class="h-auto justify-start p-4 text-left"
              >
                <span class="grid gap-1">
                  <span class="font-semibold text-highlighted">{{
                    item.label
                  }}</span>
                  <span class="text-sm font-normal text-muted">{{
                    item.question
                  }}</span>
                </span>
              </UButton>
            </div>
          </section>

          <WorkspaceKitchenResearchSegue
            capability="Calendar"
            base-path="/workspace/kitchen/calendar/search-demand"
          />
        </section>
        <WorkspaceFreemium
          family="kitchen"
          capability="calendar"
          page-label="Calendar"
          placement="bottom"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import { computed, ref } from 'vue'
import { useKitchenWorkspace } from '../../../../kitchen/composables/workspace/core/useKitchenWorkspace'
import { kitchenCalendarSearchDemand } from '../../../../kitchen/models/calendar-search-demand'

useKitchenWorkspace()
const demand = kitchenCalendarSearchDemand
const today = new Date()
const dateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
const todayKey = dateKey(today)
const selectedDate = ref(todayKey)
const selectedDateLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${selectedDate.value}T12:00:00`))
)

function moveDay(delta: number) {
  const date = new Date(`${selectedDate.value}T12:00:00`)
  date.setDate(date.getDate() + delta)
  selectedDate.value = dateKey(date)
}

function showToday() {
  selectedDate.value = todayKey
}

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'authenticated',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-calendar',
    label: 'Calendar',
    group: 'Workspace',
    icon: 'i-lucide-calendar-range',
    position: 'top',
    order: 1,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
