<template>
  <UCard class="overflow-hidden">
    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <UAvatar
          :src="resolvedImageUrl || undefined"
          :alt="name"
          size="xl"
          icon="i-lucide-image"
          :class="avatarShadeClass"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="truncate text-base font-semibold">{{ name }}</div>
              <div v-if="formattedAddress" class="truncate text-xs text-dimmed">
                {{ formattedAddress }}
              </div>
            </div>
            <UBadge
              v-if="showBadges && sourceLabel"
              variant="soft"
              color="neutral"
              size="xs"
              class="shrink-0"
            >
              {{ sourceLabel }}
            </UBadge>
          </div>
          <div v-if="showBody" class="mt-1 line-clamp-2 text-xs text-dimmed">
            <span v-if="prop">{{ prop }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>

      <div v-if="mapUrl" class="flex items-center gap-2">
        <UButton
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-map-pin"
          :to="mapUrl"
          target="_blank"
        >
          Open map
        </UButton>
      </div>

      <div v-if="details?.length" class="space-y-2 text-xs text-dimmed">
        <div
          v-for="item in details"
          :key="item.label"
          class="grid gap-0.5"
        >
          <div class="text-[11px] font-medium uppercase tracking-wide text-muted">
            {{ item.label }}
          </div>
          <div class="truncate">
            {{ formatValue(item.value) }}
          </div>
        </div>
      </div>

      <div v-if="$slots.actions" class="pt-1">
        <slot name="actions" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PlaceImageShade } from 'fireux-places/runtime/models/objects/place.model'
import { computed } from 'vue'

type KitchenPreviewDetail = {
  label: string
  value?: string | number | null
}

type Props = {
  imageUrl: string
  imageShade?: PlaceImageShade
  name: string
  formattedAddress: string
  source: 'google' | 'fireux' | 'manual'
  prop?: string
  showBadges?: boolean
  showBody?: boolean
  details?: KitchenPreviewDetail[]
  mapUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  showBadges: true,
  showBody: true,
})

const resolvedImageUrl = computed(() => props.imageUrl || '')

const avatarShadeClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const sourceLabel = computed(() =>
  props.source === 'fireux'
    ? 'FireUX'
    : props.source === 'manual'
      ? 'Manual'
      : props.source === 'google'
        ? 'Google'
        : ''
)

const formatValue = (value?: string | number | null) => {
  if (value == null) return '—'
  const str = String(value).trim()
  return str ? str : '—'
}
</script>
