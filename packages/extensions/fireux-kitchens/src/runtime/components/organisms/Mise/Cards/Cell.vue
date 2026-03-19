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
        :src="imageUrl || undefined"
        icon="i-lucide-clipboard-check"
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
          </div>

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

        <div class="truncate text-xs text-dimmed">
          <span>Category: {{ category || '—' }}</span>
          <span class="mx-1">·</span>
          <span>Unit: {{ unit || '—' }}</span>
        </div>

        <div
          v-if="showTagline"
          class="truncate text-xs text-dimmed"
        >
          <span v-if="prop || description">{{ prop || description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { MiseEnPlaceCard } from '../../../../composables/fireux/firestore/runtime-kitchen/mise/utils/view/useMiseEnPlaceInterface'

type Props = Pick<
  MiseEnPlaceCard.Card,
  'to' | 'name' | 'subtitle' | 'status' | 'category' | 'unit' | 'imageUrl' | 'description'
> & {
  prop?: string
  showSubtitle?: boolean
  showStatus?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showStatus: true,
  showTagline: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
