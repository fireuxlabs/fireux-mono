<template>
  <UCard class="fx-card fx-card--profile">
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <UAvatar :src="avatar || undefined" :alt="title" size="md" />

          <div class="min-w-0">
            <div class="truncate text-lg font-semibold leading-6">{{ title }}</div>
            <div class="mt-0.5 text-sm text-dimmed truncate">
              <span v-if="subtitle">{{ subtitle }}</span>
              <span v-else class="italic">missing</span>
            </div>
            <div v-if="tagline" class="mt-2 text-sm text-dimmed line-clamp-2">
              {{ tagline }}
            </div>
          </div>
        </div>

        <div class="shrink-0 grid justify-items-end gap-2">
          <AppBrandWordmark
            v-if="wordmarkLight || wordmarkDark || wordmark"
            size="small"
            :light-src="wordmarkLight"
            :dark-src="wordmarkDark"
          />

          <div class="flex flex-wrap justify-end gap-2">
            <UBadge v-if="role" variant="subtle" color="neutral" size="xs">
              {{ role }}
            </UBadge>
            <UBadge v-if="shortName" variant="subtle" color="neutral" size="xs">
              @{{ shortName }}
            </UBadge>
            <UBadge
              v-if="typeof userCount === 'number'"
              variant="subtle"
              color="neutral"
              size="xs"
            >
              {{ userCount }} users
            </UBadge>
          </div>

          <div v-if="id" class="text-xs text-dimmed font-mono">
            {{ id }}
          </div>
        </div>
      </div>
    </template>

    <div class="space-y-5">
      <div class="space-y-1">
        <div class="text-xs text-dimmed">Description</div>
        <div class="text-sm">
          <span v-if="app?.description">{{ app.description }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="rounded border p-4 space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">App ID</div>
          <div class="text-sm font-mono">
            <span v-if="app?.id">{{ app.id }}</span>
            <span v-else class="text-dimmed">missing</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Ecosystem</div>
          <div class="text-sm">
            <span v-if="app?.ecosystem">{{ app.ecosystem }}</span>
            <span v-else class="text-dimmed">missing</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Links</div>
          <div class="flex flex-wrap justify-end gap-2">
            <a
              v-if="app?.logo_url"
              :href="app.logo_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm underline"
            >
              logo
            </a>
            <a
              v-if="app?.wordmark_light_url || app?.wordmark_dark_url"
              :href="app?.wordmark_light_url || app?.wordmark_dark_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm underline"
            >
              wordmark
            </a>
            <a
              v-if="app?.social_links?.instagram"
              :href="app.social_links.instagram"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm underline"
            >
              instagram
            </a>
            <span
              v-if="!app?.logo_url && !(app?.wordmark_light_url || app?.wordmark_dark_url) && !app?.social_links?.instagram"
              class="text-sm text-dimmed italic"
            >
              missing
            </span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import AppBrandWordmark from '../../../App/Brand/Wordmark.vue'

defineOptions({ inheritAttrs: false })

defineProps<
  { app?: App | null } &
    Pick<
      AppCard.Card,
      | 'id'
      | 'shortName'
      | 'role'
      | 'userCount'
      | 'tagline'
      | 'wordmark'
      | 'wordmarkLight'
      | 'wordmarkDark'
      | 'avatar'
      | 'title'
      | 'subtitle'
      | 'badges'
    >
>()
</script>
