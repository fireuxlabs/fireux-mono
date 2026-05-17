<template>
  <UDashboardPanel id="console-kitchen-orders">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Orders">
        <template #right>
          <div class="flex items-center gap-2">
            <span class="text-sm text-dimmed">{{ clockLabel }}</span>
            <UBadge color="neutral" variant="subtle">
              {{ modeLabel }}
            </UBadge>
          </div>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOrders />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useKitchenConsoleOrders } from '../../../composables/fireux/console/kitchen/operations/useKitchenConsoleOrders'

const formatTime = (value: number) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

const timestampMs = (value: unknown) => {
  const seconds = Number((value as { seconds?: number } | null)?.seconds)
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0
}

const orderCreatedMs = (order: unknown) =>
  timestampMs((order as any)?.created?.at) ||
  timestampMs((order as any)?.updated?.at)

const { selectedMode, orders } = useKitchenConsoleOrders()
const nowMs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    nowMs.value = Date.now()
  }, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const modeLabel = computed(() => {
  const mode = String(selectedMode.value || '').trim()
  if (mode === 'demo') return 'Demo time'
  if (mode === 'test') return 'Test time'
  return 'Real time'
})
const demoNowMs = computed(() => {
  const times = orders.value
    .map(orderCreatedMs)
    .filter((value) => value > 0)
    .sort((a, b) => a - b)

  if (!times.length) return nowMs.value

  const anchor = times[Math.min(2, times.length - 1)]
  return anchor + 2 * 60 * 1000
})
const clockLabel = computed(() =>
  formatTime(selectedMode.value === 'demo' ? demoNowMs.value : nowMs.value)
)

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-orders',
    label: 'Orders',
    icon: 'i-lucide-receipt-text',
    position: 'top',
    requiresSelection: true,
    order: 7,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
