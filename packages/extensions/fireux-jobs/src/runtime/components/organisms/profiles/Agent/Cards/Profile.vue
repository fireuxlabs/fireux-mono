<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatarGroup v-if="card.secondaryAvatarUrl" size="md">
            <UAvatar :src="card.avatarUrl || undefined" :alt="card.displayName" size="md" />
            <UAvatar :src="card.secondaryAvatarUrl || undefined" :alt="card.displayName" size="xs" />
          </UAvatarGroup>
          <UAvatar v-else :src="card.avatarUrl || undefined" :alt="card.displayName" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ card.displayName }}</div>
            <div class="text-sm text-dimmed">
                <span v-if="showSubtitle && card.title">{{ card.title }}</span>
                <span v-else-if="showSubtitle" class="italic">missing</span>
            </div>
          </div>
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
    </template>

    <div class="space-y-4">
      <div v-if="prop" class="text-sm text-dimmed">
        {{ prop }}
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Summary</div>
        <div class="text-sm">
          <span v-if="prop || card.summary">{{ prop || card.summary }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Contact</div>
        <div class="text-sm">
          <span v-if="card.contactEmail">{{ card.contactEmail }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Website</div>
        <div class="text-sm">
          <span v-if="card.websiteUrl">{{ card.websiteUrl }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent';

const props = withDefaults(
  defineProps<{
    card: AgentCard.Card
    prop?: string
    showSubtitle?: boolean
  }>(),
  {
    showSubtitle: true,
  }
)

const badges = computed(() => props.card.badges ?? [])
</script>
