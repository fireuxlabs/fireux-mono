<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/organisms/entities/Job/Cards/Pill.vue -->

<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="title"
      :description="showSubtitle ? (resolvedSubtitle || undefined) : undefined"
      :avatar="avatarUrl ? { src: avatarUrl || undefined, alt: title || '' } : undefined"
      size="sm"
    >
      <template #default>
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
      </template>
    </UUser>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

type PillProps = Pick<JobCard.Card, 'to' | 'avatarUrl' | 'title' | 'badges'> & {
  // Allow passing a location subtitle (preferred over status).
  subtitle?: string

  // Optional: if callers pass kitchen data, we can derive a nice subtitle.
  kitchen?: {
    short_address?: string
    formatted_address?: string
    name?: string
  } | null

  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  subtitle: '',
  kitchen: null,
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const resolvedSubtitle = computed(() => {
  // 1) explicit subtitle wins
  const explicit = String(props.subtitle ?? '').trim()
  if (explicit) return explicit

  // 2) kitchen location fallback (useful default)
  const k = props.kitchen
  if (!k) return ''
  return (
    String(k.short_address ?? '').trim() ||
    String(k.formatted_address ?? '').trim() ||
    ''
  )
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>