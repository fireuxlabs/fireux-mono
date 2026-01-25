<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Pill.vue -->
<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="card card--pill pill"
    @click="onClick"
  >
    <UAvatar :src="thumbnailUrl || undefined" :alt="displayName" size="xs" />

    <div class="pill__text">
      <div class="pill__title">
        {{ displayName }}
      </div>
      <div v-if="showSubtitle && ecosystem" class="pill__subtitle">
        {{ ecosystem }}
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<AppCard.Card, 'to' | 'thumbnailUrl' | 'displayName' | 'ecosystem' | 'badges'> & {
      showSubtitle?: boolean
      showBadges?: boolean
      link?: boolean
      action?: boolean
    }
  >(),
  {
    badges: () => [],
    showSubtitle: true,
    showBadges: true,
    link: false,
    action: false,
  }
)

const onClick = () => {
  if (props.action) emit('action')
}

</script>