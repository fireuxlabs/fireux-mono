<template>
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="block w-full"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-default bg-elevated/30 p-3 transition hover:bg-elevated/60"
    >
      <UAvatar
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="title"
        size="md"
        class="shrink-0"
      />
      <div
        v-else
        class="flex size-10 shrink-0 items-center justify-center rounded-md border border-default bg-elevated/40 text-dimmed"
      >
        <UIcon name="i-lucide-scroll-text" class="size-5" />
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-highlighted">
              {{ title }}
            </div>
            <div v-if="showSubtitle && subtitle" class="truncate text-xs text-dimmed">
              {{ subtitle }}
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <UBadge
              v-if="showStatus && status"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ status }}
            </UBadge>
          </div>
        </div>

        <div
          v-if="showBadges && badges.length"
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

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">No summary yet</span>
        </div>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    class="block w-full"
    @click="onClick"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-default bg-elevated/30 p-3 transition hover:bg-elevated/60"
    >
      <UAvatar
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="title"
        size="md"
        class="shrink-0"
      />
      <div
        v-else
        class="flex size-10 shrink-0 items-center justify-center rounded-md border border-default bg-elevated/40 text-dimmed"
      >
        <UIcon name="i-lucide-scroll-text" class="size-5" />
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-highlighted">
              {{ title }}
            </div>
            <div v-if="showSubtitle && subtitle" class="truncate text-xs text-dimmed">
              {{ subtitle }}
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <UBadge
              v-if="showStatus && status"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ status }}
            </UBadge>
          </div>
        </div>

        <div
          v-if="showBadges && badges.length"
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

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">No summary yet</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeCard } from '../../../../../../composables/fireux/firestore/recipe/utils/view/useRecipeInterface'

type Props = Pick<
  RecipeCard.Card,
  'to' | 'title' | 'status' | 'badges'
> & {
  avatarUrl?: string
  subtitle?: string
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showStatus?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  subtitle: '',
  prop: '',
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  showStatus: true,
  showTagline: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
