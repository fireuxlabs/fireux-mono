<template>
  <!-- Card spine: docs/concepts/collection-manager.md. Keep aligned with App/Cards/Pill.vue and Kitchen/Cards/Pill.vue: direct props, NuxtLink when link && to. -->
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="pill"
  >
    <div class="flex min-w-0 items-start gap-2">
      <div class="shrink-0">
        <UAvatar
          :src="imageUrl || undefined"
          :alt="title || ''"
          size="sm"
          icon="i-lucide-book-open-check"
        />
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p
          v-if="showSubtitle && subtitle"
          class="truncate text-xs text-toned"
        >
          {{ subtitle }}
        </p>
        <span
          v-if="actionLabel"
          class="inline-flex w-fit items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-inverted"
        >
          {{ actionLabel }}
        </span>
      </div>
    </div>
  </NuxtLink>

  <button
    v-else
    type="button"
    class="pill"
    @click="onClick"
  >
    <div class="flex min-w-0 items-start gap-2">
      <div class="shrink-0">
        <UAvatar
          :src="imageUrl || undefined"
          :alt="title || ''"
          size="sm"
          icon="i-lucide-book-open-check"
        />
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p
          v-if="showSubtitle && subtitle"
          class="truncate text-xs text-toned"
        >
          {{ subtitle }}
        </p>
        <span
          v-if="actionLabel"
          class="inline-flex w-fit items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-inverted"
        >
          {{ actionLabel }}
        </span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import type { MenuCard } from '../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'

type MenuPillCard = Pick<
  MenuCard.Card,
  'to' | 'title' | 'subtitle' | 'imageUrl' | 'actionLabel'
>

type PillProps = MenuPillCard & {
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  to: '',
  title: '',
  subtitle: '',
  imageUrl: '',
  actionLabel: '',
  showSubtitle: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return

  navigateTo(props.to)
}
</script>
