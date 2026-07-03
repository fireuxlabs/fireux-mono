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
              v-if="menuServiceChip.known"
              :color="menuServiceChip.color"
              variant="soft"
            >
              {{ menuServiceChip.label }}
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
import { useMenuComputed } from '../../../composables/fireux/firestore/menu/useMenu'

const props = defineProps<{
  menu: Menu
  summary: string
  to: string
}>()

const { menuServiceChip } = useMenuComputed(
  computed(() => props.menu),
  computed(() => false)
)
const text = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => text(props.menu.name))
const menuDescription = computed(() => text(props.menu.description))
</script>
