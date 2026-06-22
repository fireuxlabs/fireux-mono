<template>
  <UCard class="overflow-hidden">
    <div class="space-y-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
        <UAvatar
          :src="resolvedImageUrl || undefined"
          :alt="name"
          size="3xl"
          icon="i-lucide-chef-hat"
          :class="avatarShadeClass"
        />

        <div class="min-w-0 flex-1 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 space-y-1">
              <p class="text-xs font-medium uppercase tracking-[0.16em] text-toned">
                {{ eyebrow }}
              </p>

              <h2 class="truncate text-xl font-semibold text-highlighted">
                {{ name }}
              </h2>

              <div v-if="primaryAddress" class="flex items-start gap-2 text-sm text-toned">
                <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0 text-muted" />
                <span>{{ primaryAddress }}</span>
              </div>
            </div>

            <div v-if="visibleBadges.length" class="flex shrink-0 flex-wrap justify-end gap-1">
              <UBadge
                v-for="badge in visibleBadges"
                :key="badge"
                variant="soft"
                color="neutral"
                size="xs"
              >
                {{ badge }}
              </UBadge>
            </div>
          </div>

          <p v-if="showBody && prop" class="max-w-2xl text-sm text-dimmed">
            {{ prop }}
          </p>

          <div v-if="visibleDetails.length" class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="item in visibleDetails"
              :key="item.label"
              class="rounded-lg bg-muted/40 p-3"
            >
              <div class="text-[11px] font-medium uppercase tracking-wide text-muted">
                {{ item.label }}
              </div>
              <div class="mt-1 truncate text-sm text-toned">
                {{ formatValue(item.value) }}
              </div>
            </div>
          </div>

          <div v-if="mapUrl || website || $slots.actions" class="flex flex-wrap gap-2 pt-1">
            <UButton
              v-if="mapUrl"
              size="sm"
              variant="soft"
              color="neutral"
              icon="i-lucide-map-pin"
              :to="mapUrl"
              target="_blank"
            >
              Open map
            </UButton>
            <UButton
              v-if="website"
              size="sm"
              variant="soft"
              color="neutral"
              icon="i-lucide-globe"
              :to="website"
              target="_blank"
            >
              Website
            </UButton>
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PlaceImageShade } from 'fireux-places/runtime/models/place.model'
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
  shortAddress?: string
  source?: 'google' | 'fireux' | 'manual'
  prop?: string
  website?: string
  phone?: string
  currencyCode?: string
  menuAvailable?: boolean
  eyebrow?: string
  showBadges?: boolean
  showBody?: boolean
  details?: KitchenPreviewDetail[]
  mapUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: 'Kitchen',
  showBadges: true,
  showBody: true,
  menuAvailable: true,
})

const resolvedImageUrl = computed(() => props.imageUrl || '')
const primaryAddress = computed(() => props.shortAddress || props.formattedAddress)

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
const visibleBadges = computed(() =>
  props.showBadges
    ? [
        props.menuAvailable ? 'Menu available' : 'Menu unavailable',
        sourceLabel.value,
      ].filter(Boolean)
    : []
)
const visibleDetails = computed(() =>
  (props.details ?? [])
    .map((item) => ({
      label: item.label,
      value: item.value,
    }))
    .filter((item) => formatValue(item.value) !== '—')
)

const formatValue = (value?: string | number | null) => {
  if (value == null) return '—'
  const str = String(value).trim()
  return str ? str : '—'
}
</script>
