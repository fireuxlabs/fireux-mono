<template>
  <div
    class="pill"
    :class="{ 'opacity-60 cursor-not-allowed': disabled }"
    :role="action && !disabled ? 'button' : undefined"
    :tabindex="action && !disabled ? 0 : undefined"
    @click="emitAction"
    @keydown.enter.prevent="emitAction"
    @keydown.space.prevent="emitAction"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        :src="card.imageUrl || undefined"
        :alt="card.title"
        size="sm"
        icon="i-lucide-circle"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ card.title }}
        </p>

        <p
          v-if="showSubtitle && card.subtitle"
          class="truncate text-xs text-toned"
        >
          {{ card.subtitle }}
        </p>

        <div
          v-if="showBadges && card.badges?.length"
          class="flex flex-wrap items-center gap-1"
        >
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConsoleTargetCard } from './types'

const props = withDefaults(
  defineProps<{
    card: ConsoleTargetCard
    action?: boolean
    disabled?: boolean
    showBadges?: boolean
    showSubtitle?: boolean
  }>(),
  {
    action: false,
    disabled: false,
    showBadges: true,
    showSubtitle: true,
  }
)

const emit = defineEmits<{
  (event: 'action'): void
}>()

function emitAction() {
  if (props.disabled) return
  if (!props.action) return
  emit('action')
}
</script>
