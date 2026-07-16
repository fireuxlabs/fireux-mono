<template>
  <!-- Card spine: docs/concepts/collection-manager.md. Keep aligned with App/Cards/Cell.vue and Kitchen/Cards/Cell.vue: direct props, NuxtLink when link && to. -->
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="block w-full"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3 transition hover:bg-[var(--ui-bg-elevated)]"
    >
      <div class="shrink-0">
        <UAvatar
          :src="imageUrl || undefined"
          alt=""
          icon="i-lucide-book-open-check"
          size="md"
          :class="avatarClass"
        />
      </div>

      <div class="min-w-0 flex-1 space-y-1.5">
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

        </div>

        <div
          v-if="showTagline && description"
          class="truncate text-xs text-dimmed"
        >
          <span>{{ description }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>

  <button
    v-else
    type="button"
    class="block w-full text-left"
    @click="onClick"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3 transition hover:bg-[var(--ui-bg-elevated)]"
    >
      <div class="shrink-0">
        <UAvatar
          :src="imageUrl || undefined"
          alt=""
          icon="i-lucide-book-open-check"
          size="md"
          :class="avatarClass"
        />
      </div>

      <div class="min-w-0 flex-1 space-y-1.5">
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

        </div>

        <div
          v-if="showTagline && description"
          class="truncate text-xs text-dimmed"
        >
          <span>{{ description }}</span>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import type { PlaceImageShade } from 'fireux-places/runtime/models/place.model'
import { computed } from 'vue'
import type { MenuCard } from '../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'

type MenuCellCard = Pick<
  MenuCard.Card,
  | 'to'
  | 'title'
  | 'subtitle'
  | 'description'
  | 'imageUrl'
  | 'imageShade'
>

type Props = MenuCellCard & {
  imageShade?: PlaceImageShade
  showSubtitle?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  to: '',
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  imageShade: undefined,
  showSubtitle: true,
  showTagline: true,
  link: false,
  action: false,
})

const avatarClass = computed(() => {
  const shade = props.imageShade
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
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
