<template>
  <NuxtLink
    :to="to"
    class="block rounded-lg border border-[var(--ui-border)] px-3 py-2 transition-colors hover:bg-[var(--ui-bg-muted)]"
  >
    <div class="flex items-start gap-3">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ title }}</div>
            <div v-if="subtitle" class="truncate text-sm text-dimmed">{{ subtitle }}</div>
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
          <span v-if="prop || line1">{{ prop || line1 }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { reactive, toRefs, watchEffect } from 'vue'
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'

const props = defineProps<{ card: AgentCard.Card; prop?: string }>()

const card = reactive({ ...props.card })

watchEffect(() => {
  Object.assign(card, props.card)
})

const { to, avatar, title, subtitle, badges, line1 } = toRefs(card)

const prop = props.prop
</script>
