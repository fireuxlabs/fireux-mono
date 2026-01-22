<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-cell"
    @click="onClick"
  >
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ displayName }}</div>
            <div v-if="showSubtitle && tagline" class="fx-cell__subtitle">
              {{ tagline }}
            </div>
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
          <span v-if="prop || bioShort">{{ prop || bioShort }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'

type Props = Pick<
  ChefCard.Card,
  'to' | 'avatarUrl' | 'displayName' | 'tagline' | 'badges' | 'bioShort'
> & {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
