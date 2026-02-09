<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/organisms/Job/Cards/Cell.vue -->

<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="card card--cell"
    @click="onClick"
  >
    <div class="flex items-start gap-3">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title"
        size="sm"
        icon="i-lucide-briefcase"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <!-- Top row: title + status -->
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="card__title truncate">
              {{ title }}
            </div>

            <div v-if="showSubtitle && subtitle" class="card__subtitle truncate">
              {{ subtitle }}
            </div>
          </div>

          <div class="shrink-0 flex items-center gap-2">
            <UBadge
              v-if="showStatus && statusLabel"
              size="xs"
              variant="soft"
              :color="statusColor"
            >
              {{ statusLabel }}
            </UBadge>

            <div v-if="showBadges && badges.length" class="hidden sm:flex flex-wrap items-center justify-end gap-1">
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

        <!-- Body: short description / prop -->
        <div v-if="showTagline" class="text-sm text-dimmed">
          <span v-if="prop">{{ prop }}</span>
          <span v-else-if="description">{{ description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JobCard } from '../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

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
  const s = String(props.status ?? '').trim().toLowerCase()
  if (!s) return ''
  if (s === 'open') return 'Open'
  if (s === 'closed') return 'Closed'
  return s
})

const statusColor = computed(() => {
  const s = String(props.status ?? '').trim().toLowerCase()
  if (s === 'open') return 'success'
  if (s === 'closed') return 'neutral'
  return 'neutral'
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>