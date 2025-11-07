<!-- packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue -->
<template>
  <div class="space-y-6">
    <slot name="current" :profile="current" />

    <div v-if="shouldShowCta">
      <UPageSection>
        <UPageCTA :title="cta" variant="soft">
          <template #links>
            <slot name="cta">
              <UButton
                size="lg"
                color="primary"
                :label="ctaLabel"
                @click="$emit('ensure')"
              />
            </slot>
          </template>
        </UPageCTA>
      </UPageSection>
    </div>

    <UPageSection>
      <div class="flex items-center gap-2 mb-3">
        <slot name="list-header" />
        <UButton
          v-if="more"
          size="xs"
          variant="ghost"
          @click="$emit('load-more')"
        >
          {{ moreLabel }}
        </UButton>
      </div>

      <div
        v-if="items?.length"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <slot
          v-for="it in items"
          name="item"
          :key="it?.id || it?.uid"
          :profile="it"
        />
      </div>
      <p v-else class="opacity-70">{{ emptyText }}</p>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current?: any | null
    items?: any[]
    cta?: string
    ctaLabel?: string
    emptyText?: string
    more?: boolean
    moreLabel?: string
    ctaVisible?: boolean
  }>(),
  {
    current: null,
    items: () => [],
    cta: 'Complete your profile',
    ctaLabel: 'Create',
    emptyText: 'Nothing to show yet.',
    more: false,
    moreLabel: 'Load more',
    ctaVisible: undefined,
  }
)

defineEmits<{ (e: 'ensure'): void; (e: 'load-more'): void }>()

const shouldShowCta = computed(() =>
  props.ctaVisible !== undefined ? props.ctaVisible : props.current == null
)
</script>
