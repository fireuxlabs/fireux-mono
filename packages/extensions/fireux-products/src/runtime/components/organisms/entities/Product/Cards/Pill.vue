<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill transition-colors hover:bg-primary/5 hover:border-primary/30"
  >
    <UUser
      :name="title"
      :description="showSubtitle ? (subtitle || undefined) : undefined"
      :avatar="avatarUrl ? { src: avatarUrl || undefined, alt: title || '' } : undefined"
      size="sm"
      class="font-medium"
    >
      <template v-if="showBadges && (badges?.length ?? 0)" #description>
        <div class="flex flex-col gap-1">
          <span v-if="showSubtitle && subtitle" class="text-xs text-muted-foreground">{{ subtitle }}</span>
          <div class="flex flex-wrap items-center gap-1 justify-between">
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
      </template>
    </UUser>
  </component>
</template>

<script setup lang="ts">
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface';

type PillProps = Pick<ProductCard.Card, 'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges'> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
