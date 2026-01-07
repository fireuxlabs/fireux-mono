<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Preview.vue -->
<template>
  <UCard class="fx-card">
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <UAvatar :src="avatar || undefined" :alt="title" size="md" />

          <div class="min-w-0">
            <div class="truncate text-lg font-semibold leading-6">{{ title }}</div>
          </div>
        </div>

        <div v-if="showWordmark" class="shrink-0">
          <AppBrandWordmark
            size="small"
            :light-src="wordmarkLight"
            :dark-src="wordmarkDark"
          />
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <div v-if="showSubtitle && subtitle" class="text-sm text-dimmed truncate">
        {{ subtitle }}
      </div>

      <div v-if="showBadges && badges.length" class="flex flex-wrap gap-2">
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

      <div v-if="showTagline && tagline" class="text-sm text-dimmed line-clamp-2">
        {{ tagline }}
      </div>

      <div v-if="showMeta" class="flex flex-wrap items-center gap-2">
        <div v-if="shortName" class="text-xs text-dimmed">
          <span class="font-mono">@{{ shortName }}</span>
        </div>

        <div v-if="id" class="text-xs text-dimmed">
          <span class="font-mono break-all">{{ id }}</span>
        </div>

        <UBadge
          v-if="userCount !== null"
          variant="soft"
          color="neutral"
          size="xs"
          class="inline-flex items-center gap-1"
        >
          <UIcon name="i-lucide-users" class="size-3 shrink-0" />
          <span class="truncate">{{ userCount }}</span>
        </UBadge>
      </div>

      <div v-if="showSocials && socialItems.length" class="flex flex-wrap items-center gap-2">
        <a
          v-for="item in socialItems"
          :key="item.platform"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center"
          :title="item.platform"
          :aria-label="item.platform"
        >
          <Icon :name="item.icon" mode="svg" class="size-5" />
        </a>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useSocialLinks } from '../../../../composables/fireux/app/ui/useSocialLinks'

const props = withDefaults(
  defineProps<
    Pick<
      AppCard.Card,
      | 'id'
      | 'shortName'
      | 'avatar'
      | 'title'
      | 'subtitle'
      | 'badges'
      | 'tagline'
      | 'userCount'
      | 'wordmarkLight'
      | 'wordmarkDark'
      | 'socialLinks'
    > & {
      showSubtitle?: boolean
      showBadges?: boolean
      showTagline?: boolean
      showMeta?: boolean
      showWordmark?: boolean
      showSocials?: boolean
    }
  >(),
  {
    showSubtitle: true,
    showBadges: true,
    showTagline: true,
    showMeta: true,
    showWordmark: true,
    showSocials: true,
  }
)

const { toItems } = useSocialLinks()
const socialItems = computed(() => toItems(props.socialLinks))
</script>