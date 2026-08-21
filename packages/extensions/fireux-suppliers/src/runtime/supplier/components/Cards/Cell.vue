<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    class="block w-full"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="avatarUrl || undefined"
        :alt="title"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ title }}</div>
            <div
              v-if="showSubtitle && subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ subtitle }}
            </div>
          </div>

          <div
            v-if="showBadges && badges.length"
            class="flex shrink-0 flex-wrap items-center gap-1"
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

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="summary">{{ summary }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../composables/firestore/utils/view/useSupplierInterface'

type Props = Pick<
  SupplierCard.Card,
  'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges' | 'summary'
> & {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,
  disabled: false,
})
</script>
