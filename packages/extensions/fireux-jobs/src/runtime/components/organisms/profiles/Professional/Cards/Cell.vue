<template>
  <NuxtLink
    :to="to"
    class="block rounded-lg border border-[var(--ui-border)] px-3 py-2 transition-colors hover:bg-[var(--ui-bg-muted)]"
  >
    <div class="flex items-start gap-3">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ displayName }}</div>
            <div v-if="tagline" class="truncate text-sm text-dimmed">{{ tagline }}</div>
          </div>

          <div v-if="badges.length" class="flex flex-wrap justify-end gap-1">
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

        <div class="mt-1 text-sm text-dimmed">
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
