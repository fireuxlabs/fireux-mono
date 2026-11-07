<template>
  <UCard class="preview">
    <div class="fx-card-body-stack">
      <div>
        <UAvatar
          :src="resolvedImageUrl || undefined"
          :alt="name"
          size="3xl"
          icon="i-lucide-chef-hat"
          :class="avatarShadeClass"
        />

        <div>
          <div class="card__header">
            <div class="fx-card-body-stack">
              <p class="fx-type-label">
                {{ eyebrow }}
              </p>

              <h2 class="fx-truncate">
                {{ name }}
              </h2>

              <div v-if="primaryAddress" class="card__media">
                <UIcon name="i-lucide-map-pin" />
                <span>{{ primaryAddress }}</span>
              </div>
            </div>

            <div v-if="visibleBadges.length">
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

          <p v-if="showBody && prop">
            {{ prop }}
          </p>

          <div v-if="visibleDetails.length">
            <div v-for="item in visibleDetails" :key="item.label">
              <div class="fx-type-label">
                {{ item.label }}
              </div>
              <div class="fx-truncate">
                {{ formatValue(item.value) }}
              </div>
            </div>
          </div>

          <div v-if="to || mapUrl || website || $slots.actions">
            <UButton
              v-if="to"
              size="sm"
              variant="soft"
              color="neutral"
              icon="i-lucide-external-link"
              :to="to"
            >
              View kitchen
            </UButton>
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
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'
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
  prop?: string
  website?: string
  phone?: string
  currencyCode?: string
  eyebrow?: string
  badges?: string[]
  showBadges?: boolean
  showBody?: boolean
  details?: KitchenPreviewDetail[]
  mapUrl?: string
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: 'Kitchen',
  showBadges: true,
  showBody: true,
})

const resolvedImageUrl = computed(() => props.imageUrl || '')
const primaryAddress = computed(
  () => props.shortAddress || props.formattedAddress
)

const avatarShadeClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const visibleBadges = computed(() =>
  props.showBadges ? [...(props.badges ?? [])].filter(Boolean) : []
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
