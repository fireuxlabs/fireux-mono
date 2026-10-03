<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar :src="avatarUrl || undefined" :alt="title" size="sm" />

      <div class="preview__main">
        <div class="preview__top">
          <div class="preview__title">{{ title }}</div>

          <div v-if="showBadges && badges.length" class="preview__badges">
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

        <div v-if="showSubtitle && subtitle" class="preview__subtitle">
          {{ subtitle }}
        </div>

        <div v-if="showBody" class="preview__body">
          <div class="preview__line">
            <span v-if="summary">{{ summary }}</span>
            <span v-else class="italic">missing</span>
          </div>

          <div class="preview__line text-dimmed">
            <span v-if="categoriesCsv">{{ categoriesCsv }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../composables/firestore/utils/view/useSupplierInterface'

type Props = {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showBody?: boolean
} & Pick<
  SupplierCard.Card,
  | 'avatarUrl'
  | 'title'
  | 'subtitle'
  | 'badges'
  | 'summary'
  | 'categoriesCsv'
  | 'locationsLabel'
>

withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showBadges: true,
  showBody: true,
})
</script>
