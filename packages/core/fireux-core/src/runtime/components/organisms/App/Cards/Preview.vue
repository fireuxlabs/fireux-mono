<template>
  <UCard class="fx-card fx-card--preview space-y-3">
    <div class="fx-card__media">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />

      <div class="fx-card__content space-y-1">
        <div class="fx-card__header">
          <div class="min-w-0">
            <div class="fx-card__title">{{ title }}</div>
            <div v-if="subtitle" class="fx-card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div class="grid justify-items-end gap-1">
            <AppBrandWordmark
              v-if="wordmarkLight || wordmarkDark || wordmark"
              size="card"
              :light-src="wordmarkLight"
              :dark-src="wordmarkDark"
              class="fx-card__wordmark"
            />

            <div v-if="badges.length" class="fx-card__badges">
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
        </div>

        <div v-if="tagline" class="fx-card__tagline">
          {{ tagline }}
        </div>

        <div class="fx-card__meta">
          <div v-if="shortName" class="text-xs text-dimmed">
            <span class="font-mono">@{{ shortName }}</span>
          </div>

          <div v-if="id" class="text-xs text-dimmed">
            <span class="font-mono">{{ id }}</span>
          </div>

          <UBadge
            v-if="userCount !== null"
            variant="soft"
            color="neutral"
            size="xs"
            class="inline-flex items-center gap-1"
          >
            <UIcon name="i-lucide-users" class="size-3 shrink-0" />
            <span class="truncate">{{ userCount }}</span>
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import AppBrandWordmark from '../../../App/Brand/Wordmark.vue'

defineOptions({ inheritAttrs: false })

defineProps<
  Pick<
    AppCard.Card,
    | 'id'
    | 'shortName'
    | 'avatar'
    | 'title'
    | 'subtitle'
    | 'badges'
    | 'tagline'
    | 'userCount'
    | 'wordmark'
    | 'wordmarkLight'
    | 'wordmarkDark'
  >
>()
</script>
