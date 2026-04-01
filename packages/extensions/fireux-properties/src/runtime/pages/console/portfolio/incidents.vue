<template>
  <UDashboardPanel id="console-portfolio-incidents">
    <template #header>
      <LayoutsConsoleNavbar title="Incidents" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtimeId"
          color="warning"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /console/portfolio before using incidents."
          :actions="[
            {
              label: 'Go to portfolios',
              to: '/console/portfolio',
              icon: 'i-lucide-arrow-right'
            }
          ]"
        />

        <template v-else>
          <UCard>
            <div class="text-xs text-dimmed">
              Mode: <span class="font-medium">{{ runtimeMode }}</span>
              · Source:
              <code>{{ isReadOnly ? 'read-only scenario' : incidentsPath }}</code>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Incident Exposure</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Open</div>
                <div class="text-xl font-semibold">{{ summary.open }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Scheduled</div>
                <div class="text-xl font-semibold">{{ summary.scheduled }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Done</div>
                <div class="text-xl font-semibold">{{ summary.done }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">SLA breaches</div>
                <div class="text-xl font-semibold">{{ summary.slaBreaches }}</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Incident Board</div>
            </template>

            <div v-if="tickets.length" class="space-y-2">
              <div
                v-for="ticket in tickets"
                :key="ticket.id"
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-sm font-semibold">{{ ticket.title }}</div>
                    <div class="text-xs text-dimmed">
                      {{ propertyNameById.get(ticket.property_id) || ticket.property_id }}
                      · {{ ticket.category }}
                      · reported {{ ticket.reported_at }}
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <UBadge :color="priorityBadgeColor(ticket.priority)" variant="soft">
                      {{ ticket.priority }}
                    </UBadge>
                    <UBadge :color="statusBadgeColor(ticket.status)" variant="soft">
                      {{ ticket.status }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No incidents"
              description="No maintenance incidents in this runtime scenario."
            />
          </UCard>
        </template>

        <DevJson
          v-if="isDev"
          title="Incidents (JSON)"
          context="console/portfolio/incidents · runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useRuntimePortfolio,
  useRuntimePortfolioPath,
} from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { usePortfolioPropertyCollection } from '../../../composables/fireux/firestore/property/fetch/usePortfolioPropertyCollection'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-incidents',
    label: 'Incidents',
    icon: 'i-lucide-triangle-alert',
    order: 35,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const { collection: propertyCollection } = usePortfolioPropertyCollection(runtimePortfolio)
const isDev = import.meta.dev
const incidentsPath = useRuntimePortfolioPath(runtimePortfolio, 'maintenance')

const runtimeId = computed(() => String(runtimePortfolio.id.value || '').trim())
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const isReadOnly = computed(() => runtimePortfolio.isReadOnly.value)
const scenario = computed(() => runtimePortfolio.scenario.value)

const properties = computed(() => propertyCollection.value)
const tickets = computed(() => scenario.value?.maintenance ?? [])

const propertyNameById = computed(() => {
  const map = new Map<string, string>()
  for (const property of properties.value) {
    const id = String(property.id || '').trim()
    if (!id) continue
    map.set(id, String(property.name || id).trim())
  }
  return map
})

const toDateMs = (value: string) => {
  const parsed = new Date(String(value || '').trim())
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.getTime()
}

const startOfTodayMs = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const summary = computed(() => {
  const totals = {
    open: 0,
    scheduled: 0,
    done: 0,
    slaBreaches: 0,
  }

  const today = startOfTodayMs()

  for (const ticket of tickets.value) {
    if (ticket.status === 'open') totals.open += 1
    if (ticket.status === 'scheduled') totals.scheduled += 1
    if (ticket.status === 'done') totals.done += 1

    if (ticket.status !== 'done') {
      const scheduledFor = toDateMs(ticket.scheduled_for)
      if (scheduledFor !== null && scheduledFor < today) {
        totals.slaBreaches += 1
      }
    }
  }

  return totals
})

const statusBadgeColor = (status: string) => {
  if (status === 'done') return 'success'
  if (status === 'scheduled') return 'info'
  return 'warning'
}

const priorityBadgeColor = (priority: string) => {
  if (priority === 'high') return 'error'
  if (priority === 'medium') return 'warning'
  return 'neutral'
}

const runtimeSnapshot = computed(() => ({
  id: runtimePortfolio.id.value,
  mode: runtimePortfolio.mode.value,
  isReadOnly: runtimePortfolio.isReadOnly.value,
  documentCollectionPath: runtimePortfolio.documentCollectionPath.value,
  collectionPath: runtimePortfolio.collectionPath.value,
  scenario: runtimePortfolio.scenario.value,
  tickets: tickets.value,
  summary: summary.value,
}))
</script>
