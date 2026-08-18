<template>
  <div class="space-y-3 rounded-lg bg-muted/30 p-3">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-sm font-medium text-highlighted">Menus</div>
        <p class="truncate text-xs text-dimmed">{{ menuSummary }}</p>
      </div>

      <UAvatarGroup
        v-if="menuAvatarItems.length"
        :max="2"
        size="sm"
      >
        <UTooltip
          v-for="item in menuAvatarItems"
          :key="item.id"
          :text="item.name"
        >
          <UAvatar
            :src="item.imageUrl || undefined"
            :alt="item.name"
          />
        </UTooltip>
      </UAvatarGroup>
    </div>

    <div v-if="pending" class="text-sm text-dimmed">
      Loading menus...
    </div>

    <UAlert
      v-else-if="!menus.length"
      color="neutral"
      variant="soft"
      icon="i-lucide-book-open"
      title="No menus listed"
      description="This kitchen does not have active menus yet."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../../menu/models/menu.model.ts'

const props = defineProps<{
  menus?: Menu[]
  pending?: boolean
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const pending = computed(() => Boolean(props.pending))
const menus = computed(() => props.menus ?? [])
const mainMenu = computed(() => menus.value[0] ?? null)
const extraMenuCount = computed(() => Math.max(0, menus.value.length - 1))
const menuSummary = computed(() => {
  const name = clean(mainMenu.value?.name)
  if (!name) return 'No active menus yet.'
  if (!extraMenuCount.value) return name
  return `${name} + ${extraMenuCount.value} more`
})
const menuAvatarItems = computed(() =>
  menus.value.map((menu) => {
    const data = menu as Record<string, unknown>

    return {
      id: clean(menu.id),
      name: clean(menu.name) || clean(menu.id) || 'Menu',
      imageUrl: clean(data.image_url || data.cover_image),
    }
  })
)
</script>
