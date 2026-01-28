<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Pill.vue -->
<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="displayName"
      :description="showSubtitle ? (ecosystem || undefined) : undefined"
      :avatar="thumbnailUrl ? { src: thumbnailUrl || undefined, alt: displayName || '' } : undefined"
      size="sm"
    >
      <template #default>
        <div v-if="showBadges && (badges?.length ?? 0)" class="flex flex-wrap items-center gap-1">
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
      </template>
    </UUser>
  </component>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (event: 'action'): void
}>()

type Props = Partial<AppCard.Card> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  to: '',
  thumbnailUrl: '',
  displayName: '',
  ecosystem: '',
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}

</script>