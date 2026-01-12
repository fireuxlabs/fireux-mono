<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ displayName }}</div>
            <div v-if="tagline" class="fx-cell__subtitle">{{ tagline }}</div>
          </div>

          <div v-if="badges.length" class="fx-cell__badges">
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

        <div class="fx-cell__tagline">
          <span v-if="prop || bioShort">{{ prop || bioShort }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { reactive, toRefs, watchEffect } from 'vue'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional'

const props = defineProps<{ card: ProfessionalCard.Card; prop?: string }>()

const card = reactive({ ...props.card })

watchEffect(() => {
  Object.assign(card, props.card)
})

const { prop } = toRefs(props)
const { to, avatarUrl, displayName, tagline, badges, bioShort } = toRefs(card)
</script>
