<template>
  <UDashboardPanel id="console-kitchen-orders">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Orders">
        <template #right>
          <div class="flex items-center gap-2">
            <span class="text-sm text-dimmed">{{ clockLabel }}</span>
          </div>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsOrders />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const formatTime = (value: number) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

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

const clockLabel = computed(() => formatTime(nowMs.value))

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
