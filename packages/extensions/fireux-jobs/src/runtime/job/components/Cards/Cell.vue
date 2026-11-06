<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title"
        size="md"
        icon="i-lucide-briefcase"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">
              {{ title }}
            </div>

            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div class="shrink-0 flex items-center gap-1">
            <UBadge
              v-if="showStatus && statusLabel"
              size="xs"
              variant="soft"
              :color="statusColor"
            >
              {{ statusLabel }}
            </UBadge>

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
        </div>

        <div v-if="showTagline" class="card__subtitle">
          <span v-if="prop">{{ prop }}</span>
          <span v-else-if="description">{{ description }}</span>
          <span v-else class="fx-card__tagline--empty">missing</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JobCard } from '../../composables/firestore/utils/view/useJobInterface'

type Props = Pick<JobCard.Card, 'to' | 'title' | 'description' | 'badges'> & {
  imageUrl?: string
  subtitle?: string
  prop?: string

  // Optional: if the v-bind includes status, we’ll render it.
  status?: string

  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  showStatus?: boolean

  link?: boolean
  action?: boolean
}

const emit = defineEmits<{ (event: 'action'): void }>()

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  badges: () => [],
  subtitle: '',
  prop: '',

  status: '',

  showSubtitle: true,
  showBadges: true,
  showTagline: true,
  showStatus: true,

  link: false,
  action: false,
})

const statusLabel = computed(() => {
  const s = String(props.status ?? '')
    .trim()
    .toLowerCase()
  if (!s) return ''
  if (s === 'open') return 'Open'
  if (s === 'closed') return 'Closed'
  return s
})

const statusColor = computed(() => {
  const s = String(props.status ?? '')
    .trim()
    .toLowerCase()
  if (s === 'open') return 'success'
  if (s === 'closed') return 'neutral'
  return 'neutral'
})
</script>
