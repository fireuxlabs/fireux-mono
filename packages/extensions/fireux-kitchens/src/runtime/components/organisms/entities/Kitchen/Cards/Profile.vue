<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar
        :src="model.imageUrl || undefined"
        :alt="model.title"
        size="md"
        icon="i-lucide-image"
        :class="avatarShadeClass"
      />
      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ model.title }}</div>
            <div v-if="model.subtitle" class="truncate text-xs text-dimmed">{{ model.subtitle }}</div>
            <div v-if="model.prop" class="truncate text-xs text-dimmed">{{ model.prop }}</div>
          </div>
          <div class="flex flex-wrap items-center gap-1">
            <UBadge v-if="model.verified" size="xs" variant="soft" color="emerald">Verified</UBadge>
            <UBadge v-if="sourceLabel" size="xs" variant="soft" color="neutral">{{ sourceLabel }}</UBadge>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { KitchenProfile } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface';

const props = defineProps<{ model: KitchenProfile }>()

const avatarShadeClass = computed(() => {
  const shade = props.model.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const sourceLabel = computed(() =>
  props.model.source === 'fireux'
    ? 'FireUX'
    : props.model.source === 'manual'
      ? 'Manual'
      : props.model.source === 'google'
        ? 'Google'
        : ''
)
</script>
