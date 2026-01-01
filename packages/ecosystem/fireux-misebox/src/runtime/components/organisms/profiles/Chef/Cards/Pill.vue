<template>
  <NuxtLink
    :to="vmTo"
    class="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--ui-bg-muted)] px-3 py-1.5 transition-opacity hover:opacity-90"
  >
    <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-baseline gap-2">
        <div class="min-w-0 truncate text-sm font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="min-w-0 truncate text-xs text-dimmed">{{ vmSubtitle }}</div>
      </div>
    </div>

    <div v-if="vmBadges.length" class="ml-2 flex shrink-0 items-center gap-1">
      <UBadge
        v-for="badge in vmBadges"
        :key="badge"
        variant="soft"
        color="neutral"
        size="xs"
      >
        {{ badge }}
      </UBadge>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  chef?: ChefCard.Card | null
}>()

const resolved = computed<ChefCard.Card | null>(() => props.chef ?? null)

const resolvedTitle = computed(() => resolved.value?.title ?? 'Chef')
const resolvedSubtitle = computed(() => resolved.value?.subtitle || undefined)
const resolvedAvatar = computed(() => resolved.value?.avatar || null)
const resolvedBadges = computed(() => resolved.value?.badges ?? [])
const resolvedTo = computed(() => resolved.value?.to ?? '')

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
const vmBadges = computed(() => resolvedBadges.value)
const vmTo = computed(() => resolvedTo.value || '#')
</script>
