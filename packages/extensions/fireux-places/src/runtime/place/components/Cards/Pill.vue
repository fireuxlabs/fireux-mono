<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="pill"
    @activate="emit('action')"
  >
    <div class="card__media fx-card__media--start">
      <UAvatar
        v-if="imageUrl"
        :src="imageUrl || undefined"
        :alt="displayTitle || ''"
        size="sm"
        :class="avatarClass"
      />

      <div class="card__content card__stack">
        <p class="card__title">
          {{ displayTitle }}
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
import { computed } from 'vue'
import type { PlaceCard } from '../../models/place-card'
import type { PlaceImageShade } from '../../utils/place-spine'

defineOptions({ inheritAttrs: false })

type PillProps = Partial<
  Pick<
    PlaceCard.Card,
    'to' | 'imageUrl' | 'title' | 'subtitle' | 'badges' | 'shortName'
  >
> & {
  imageShade?: PlaceImageShade
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
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
  shortName: '',
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const avatarClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const displayTitle = computed(() => props.shortName || props.title)
</script>
