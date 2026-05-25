<template>
  <UCard class="w-[18rem] max-w-full shrink-0">
    <template #header>
      <div class="space-y-1">
        <div class="flex items-center justify-between gap-2">
          <div class="truncate text-sm font-semibold">
            {{ contextLabel }}
          </div>
          <div class="shrink-0 text-xs text-dimmed">
            {{ timeLabel }}
          </div>
        </div>
        <div v-if="serverName" class="text-xs">
          <span class="text-dimmed">Server:</span>
          <span class="font-medium">{{ serverName }}</span>
        </div>
      </div>
    </template>

    <div class="space-y-1">
      <div
        v-for="line in lines"
        :key="`${id}-${line.label}`"
        class="text-sm"
      >
        {{ line.qty }} X {{ line.label }}
      </div>

      <div v-if="!lines.length" class="text-xs italic text-dimmed">
        No items in this order.
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type TicketLine = {
  label: string
  qty: number
}

defineProps<{
  id: string
  contextLabel: string
  timeLabel: string
  serverName: string
  lines: TicketLine[]
}>()
</script>
