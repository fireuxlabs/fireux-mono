<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    class="pill"
    @activate="emit('action')"
  >
    <div class="card__media fx-card__media--start">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
        :class="avatarClass"
      />

      <div class="card__content card__stack">
        <p class="card__title">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="card__subtitle">
          {{ subtitle }}
        </p>
        <div v-if="showBadges && (badges?.length ?? 0)" class="card__badges">
          <UBadge
            v-for="badge in badges"
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
  </FireActionSurface>
</template>

<script setup lang="ts">
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'
import { computed } from 'vue'
import type { KitchenCard } from '../../models/kitchen-interface.model'

type PillProps = Partial<
  Pick<KitchenCard.Card, 'to' | 'imageUrl' | 'title' | 'subtitle'>
> & {
  badges?: KitchenCard.Card['badges']
  imageShade?: PlaceImageShade
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  to: '',
  imageUrl: '',
  title: '',
  subtitle: '',
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
  disabled: false,
})

const avatarClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})
</script>
