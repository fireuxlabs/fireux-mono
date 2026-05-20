<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="block w-full"
>
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar
        :src="imageUrl || undefined"
        icon="i-lucide-carrot"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ name }}</div>

            <div
              v-if="showSubtitle && subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ subtitle }}
            </div>
            <code
              v-if="showSlug && slug"
              class="block truncate text-[11px] text-dimmed"
            >
              {{ slug }}
            </code>
          </div>

          <div class="flex items-center gap-1">
            <UTooltip
              v-if="warningLabel && warningDescription"
              :text="warningDescription"
              :popper="{ placement: 'top' }"
            >
              <UBadge
                color="warning"
                variant="soft"
                size="xs"
                class="shrink-0"
              >
                <UIcon name="i-lucide-triangle-alert" class="mr-1" />
                {{ warningLabel }}
              </UBadge>
            </UTooltip>
            <UBadge
              v-else-if="warningLabel"
              color="warning"
              variant="soft"
              size="xs"
              class="shrink-0"
            >
              <UIcon name="i-lucide-triangle-alert" class="mr-1" />
              {{ warningLabel }}
            </UBadge>

            <UBadge
              v-if="showStatus && status"
              variant="soft"
              color="neutral"
              size="xs"
              class="shrink-0"
            >
              {{ status }}
            </UBadge>
          </div>
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
      class="flex w-full items-start gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar
        :src="imageUrl || undefined"
        icon="i-lucide-carrot"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ name }}</div>

            <div
              v-if="showSubtitle && subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ subtitle }}
            </div>
            <code
              v-if="showSlug && slug"
              class="block truncate text-[11px] text-dimmed"
            >
              {{ slug }}
            </code>
          </div>

          <div class="flex items-center gap-1">
            <UTooltip
              v-if="warningLabel && warningDescription"
              :text="warningDescription"
              :popper="{ placement: 'top' }"
            >
              <UBadge
                color="warning"
                variant="soft"
                size="xs"
                class="shrink-0"
              >
                <UIcon name="i-lucide-triangle-alert" class="mr-1" />
                {{ warningLabel }}
              </UBadge>
            </UTooltip>
            <UBadge
              v-else-if="warningLabel"
              color="warning"
              variant="soft"
              size="xs"
              class="shrink-0"
            >
              <UIcon name="i-lucide-triangle-alert" class="mr-1" />
              {{ warningLabel }}
            </UBadge>

            <UBadge
              v-if="showStatus && status"
              variant="soft"
              color="neutral"
              size="xs"
              class="shrink-0"
            >
              {{ status }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import type { IngredientCard } from '../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

type Props = Pick<
  IngredientCard.Card,
  'slug' | 'to' | 'name' | 'subtitle' | 'status' | 'imageUrl'
> & {
  warning?: string
  showSlug?: boolean
  showSubtitle?: boolean
  showStatus?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  showSlug: false,
  showSubtitle: true,
  showStatus: true,
  link: false,
  action: false,
})

const warningLabel = computed(() => String(props.warning || '').trim())

const warningDescription = computed(() => {
  const value = String(props.warning || '').trim()
  if (!value) return ''

  const normalized = value.toLowerCase()
  if (normalized === 'unused') {
    return 'Not used in recipes, mise, or published menu dishes'
  }
  if (normalized === 'off menu') {
    return 'Used in prep or recipes, but not on any published menu dish'
  }

  return ''
})

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}
</script>
