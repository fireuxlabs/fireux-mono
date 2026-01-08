<template>
  <NuxtLink
    :to="to"
    class="fx-pill"
  >
    <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ displayName }}</div>
      <div v-if="tagline" class="min-w-0 truncate text-xs text-dimmed">{{ tagline }}</div>
    </div>

    <div v-if="badges.length" class="ml-2 flex shrink-0 items-center gap-1">
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
  </NuxtLink>
</template>

<script setup lang="ts">
import { reactive, toRefs, watchEffect } from 'vue'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional'

const props = defineProps<{ card: ProfessionalCard.Card }>()

const card = reactive({ ...props.card })

watchEffect(() => {
  Object.assign(card, props.card)
})

const { to, avatarUrl, displayName, tagline, badges } = toRefs(card)
</script>
