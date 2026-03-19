<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="block w-full"
    @click="onClick"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar
        :src="avatarUrl || undefined"
        icon="i-lucide-store"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="truncate text-xs text-dimmed">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="flex shrink-0 flex-wrap items-center gap-1">
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
          <span v-if="prop || summary">{{ prop || summary }}</span>
          <span v-else>{{ id }}</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { SupplierCard } from 'fireux-suppliers/runtime/composables/fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface'

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<{
  to?: string
  id: string
  title: string
  subtitle: string
  avatarUrl: string
  badges?: SupplierCard.Card['badges']
  summary?: SupplierCard.Card['summary']
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}>(), {
  badges: () => [],
  summary: '',
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
