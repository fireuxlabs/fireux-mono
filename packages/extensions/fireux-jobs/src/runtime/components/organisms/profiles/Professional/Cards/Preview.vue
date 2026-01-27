<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="preview__main">
        <div class="preview__top">
          <div class="preview__title">{{ displayName }}</div>

        </div>

        <div v-if="showSubtitle && title" class="preview__subtitle">
          {{ title }}
        </div>

        <div v-if="showBody" class="preview__body">
          <div class="preview__line">
            <span v-if="prop || bioShort">{{ prop || bioShort }}</span>
            <span v-else class="italic">missing</span>
          </div>

          <div class="preview__line text-dimmed">
            <span v-if="specialtiesCsv">{{ specialtiesCsv }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type Props = {
  avatarUrl: string
  displayName: string
  title: string
  bioShort: string
  specialtiesCsv: string

  prop?: string
  showSubtitle?: boolean
  showBody?: boolean
}

withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showBody: true,
})
</script>
