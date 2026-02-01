<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="flex w-full items-start gap-3"
    @click="onClick"
  >
    <UAvatar
      :src="resolvedImageUrl || undefined"
      :alt="name"
      size="sm"
      icon="i-lucide-image"
      :class="avatarShadeClass"
    />

    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold">{{ name }}</div>

          <div v-if="showSubtitle && resolvedAddress" class="truncate text-xs text-dimmed">
            {{ resolvedAddress }}
          </div>
        </div>

        <UBadge
          v-if="showSource && sourceLabel"
          variant="soft"
          color="neutral"
          size="xs"
          class="shrink-0"
        >
          {{ sourceLabel }}
        </UBadge>
      </div>

      <div v-if="showTagline" class="truncate text-xs text-dimmed">
        <span v-if="prop">{{ prop }}</span>
        <span v-else class="italic">missing</span>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceLogoState } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlaceLogos'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

type Props = Pick<
  PlaceCard.Card,
  'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
> & {
  source?: 'google' | 'fireux' | 'manual'
  prop?: string
  showSubtitle?: boolean
  showSource?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  source: 'fireux',
  prop: '',
  showSubtitle: true,
  showSource: false,
  showTagline: false,
  link: false,
  action: false,
})

const resolvedAddress = computed(() => props.formattedAddress || '')

const placeRef = computed(() => ({
  id: props.id,
  name: props.name,
  formatted_address: resolvedAddress.value,
  imageUrl: props.imageUrl,
  source: props.source,
}))

const { avatar } = usePlaceLogoState(placeRef)

const resolvedImageUrl = computed(
  () => props.imageUrl || avatar.value || ''
)

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

const onClick = () => {
  if (props.action) emit('action')
}
</script>
