<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="card card--cell"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatar :src="avatarUrl || undefined" :alt="title" size="sm" />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="card__badges">
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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="prop || description">{{ prop || description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

type Props = Pick<JobCard.Card, 'to' | 'title' | 'description' | 'badges'> & {
  avatarUrl?: string
  subtitle?: string
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
  avatarUrl: '',
  badges: () => [],
  subtitle: '',
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
