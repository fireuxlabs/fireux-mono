<template>
  <UCard class="preview">
    <div class="fx-card__stack fx-card__stack--spaced">
      <div class="fx-card__media">
        <UAvatar
          :src="resolvedImageUrl || undefined"
          :alt="name"
          size="xl"
          icon="i-lucide-image"
          :class="avatarShadeClass"
        />
        <div class="fx-card__content">
          <div class="fx-card__header">
            <div class="fx-card__content">
              <div class="fx-card__title fx-card__title--lg">{{ name }}</div>
              <div v-if="formattedAddress" class="fx-card__subtitle">
                {{ formattedAddress }}
              </div>
            </div>
            <UBadge
              v-if="showBadges && sourceLabel"
              variant="soft"
              color="neutral"
              size="xs"
              class="fx-card__badge"
            >
              {{ sourceLabel }}
            </UBadge>
          </div>
          <div v-if="showBody" class="fx-card__body">
            <span v-if="prop">{{ prop }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>

      <div v-if="mapUrl" class="fx-card__actions">
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

      <div v-if="details?.length" class="fx-card__stack fx-card__stack--tight">
        <div
          v-for="item in details"
          :key="item.label"
          class="fx-card__stack"
        >
          <div class="fx-card__label">
            {{ item.label }}
          </div>
          <div class="fx-truncate">
            {{ formatValue(item.value) }}
          </div>
        </div>
      </div>

      <div v-if="$slots.actions" class="fx-card__actions">
        <slot name="actions" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PlaceImageShade } from 'fireux-places/runtime/models/place.model'
import { computed } from 'vue'

type CompanyPreviewDetail = {
  label: string
  value?: string | number | null
}

type Props = {
  imageUrl: string
  imageShade?: PlaceImageShade
  name: string
  formattedAddress: string
  source?: 'google' | 'fireux' | 'manual'
  prop?: string
  showBadges?: boolean
  showBody?: boolean
  details?: CompanyPreviewDetail[]
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
