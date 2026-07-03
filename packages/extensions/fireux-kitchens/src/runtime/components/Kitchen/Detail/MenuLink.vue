<template>
  <NuxtLink
    :to="to"
    class="rounded-lg border border-default p-4 transition hover:bg-elevated/50"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-base font-semibold text-highlighted">
            {{ menuName }}
          </h2>

          <ClientOnly>
            <UBadge
              v-if="menuOpenState.known"
              :color="menuOpenState.open ? 'success' : 'error'"
              variant="soft"
            >
              {{ menuOpenState.open ? 'Open now' : 'Closed now' }}
            </UBadge>
          </ClientOnly>
        </div>
        <p
          v-if="menuDescription"
          class="mt-1 text-sm text-dimmed"
        >
          {{ menuDescription }}
        </p>
        <p v-else class="mt-1 text-sm text-dimmed">
          {{ summary }}
        </p>
      </div>
      <UIcon
        name="i-lucide-arrow-up-right"
        class="mt-1 size-4 shrink-0 text-muted"
      />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../models/kitchen/menu/menu.model'
import { useKitchenServiceNow } from '../../../composables/fireux/kitchen/useKitchenServiceNow'
import { readWeekdayTimeOpenState } from '../../../utils/weekday-time'

const props = defineProps<{
  menu: Menu
  summary: string
  to: string
}>()

const { now: serviceNow } = useKitchenServiceNow()
const text = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => text(props.menu.name))
const menuDescription = computed(() => text(props.menu.description))
const menuOpenState = computed(() =>
  readWeekdayTimeOpenState(
    props.menu.ordering?.service_hours?.operation_hours,
    serviceNow.value
  )
)
</script>
