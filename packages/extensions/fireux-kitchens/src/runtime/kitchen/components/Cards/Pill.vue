<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    class="pill"
    @activate="emit('action')"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
        :class="avatarClass"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <div
          v-if="showBadges && (badges?.length ?? 0)"
          class="flex flex-wrap items-center gap-1"
        >
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
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
import type { PlaceImageShade } from 'fireux-places/runtime/place/models/place.model'
import { computed } from 'vue'
import type { KitchenCard } from '../../composables/firestore/utils/view/useKitchenInterface'

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
