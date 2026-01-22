<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-cell"
    @click="onClick"
  >
    <div class="fx-cell__media">
      <UAvatar :src="thumbnailUrl || undefined" :alt="displayName" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ displayName }}</div>
          </div>

          <div v-if="showBadges && badges.length" class="fx-cell__badges">
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

          <div v-if="showTagline" class="fx-cell__tagline">
            <span v-if="tagline">{{ tagline }}</span>
            <span v-else class="italic">missing</span>
          </div>

        <div v-if="showMeta && userCount !== null" class="fx-cell__meta">
          <MoleculesMetricBadge icon="i-lucide-users" :value="userCount" />
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

type Props = Omit<
  Pick<
    AppCard.Card,
    'to' | 'thumbnailUrl' | 'displayName' | 'badges' | 'tagline' | 'userCount'
  >,
  'userCount'
> & {
  userCount?: number | null

  showBadges?: boolean
  showTagline?: boolean
  showMeta?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  badges: () => [],
  tagline: '',
  userCount: null,
  showBadges: true,
  showTagline: true,
  showMeta: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>