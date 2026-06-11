<template>
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="card card--cell"
    :class="{ 'opacity-60 cursor-not-allowed': disabled }"
  >
    <div class="card__media">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title"
        icon="i-lucide-folders"
        size="md"
        class="shrink-0"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="card__badges">
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

        <div v-if="showMeta" class="card__tagline">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    class="card card--cell"
    :class="{ 'opacity-60 cursor-not-allowed': disabled }"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title"
        icon="i-lucide-folders"
        size="md"
        class="shrink-0"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="card__badges">
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

        <div v-if="showMeta" class="card__tagline">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

type ProjectCellProps = {
  to?: string
  imageUrl?: string
  title: string
  subtitle?: string
  meta?: string
  badges?: string[]
  showSubtitle?: boolean
  showMeta?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<ProjectCellProps>(), {
  badges: () => [],
  showSubtitle: true,
  showMeta: true,
  showBadges: true,
  link: false,
  action: false,
  disabled: false,
})

const onClick = (event?: MouseEvent) => {
  if (props.disabled) return
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}
</script>
