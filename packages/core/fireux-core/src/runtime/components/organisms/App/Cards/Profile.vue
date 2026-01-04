<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatar :src="card.avatar || undefined" :alt="card.title" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ card.title }}</div>
            <div class="text-sm text-dimmed">
              <span v-if="card.subtitle">{{ card.subtitle }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
        </div>

        <div v-if="card.badges.length" class="flex flex-wrap justify-end gap-1">
          <UBadge
            v-for="badge in card.badges"
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
      <div class="space-y-1">
        <div class="text-xs text-dimmed">Description</div>
        <div class="text-sm">
          <span v-if="app?.description">{{ app.description }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Role</div>
        <div class="text-sm">
          <span v-if="app?.role">{{ app.role }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Short name</div>
        <div class="text-sm">
          <span v-if="app?.app_short_name">{{ app.app_short_name }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="rounded border p-3">
        <div class="text-xs font-medium opacity-70">Details</div>

        <div class="mt-2 grid gap-2">
          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">App ID</div>
            <div class="text-sm">
              <span v-if="app?.id">{{ app.id }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Ecosystem</div>
            <div class="text-sm">
              <span v-if="app?.ecosystem">{{ app.ecosystem }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Logo</div>
            <div class="text-sm">
              <a
                v-if="app?.logo_url"
                :href="app.logo_url"
                target="_blank"
                rel="noopener noreferrer"
                class="underline"
              >
                view
              </a>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Wordmark</div>
            <div class="text-sm">
              <a
                v-if="app?.wordmark_url"
                :href="app.wordmark_url"
                target="_blank"
                rel="noopener noreferrer"
                class="underline"
              >
                view
              </a>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Instagram</div>
            <div class="text-sm">
              <a
                v-if="app?.social_links?.instagram"
                :href="app.social_links.instagram"
                target="_blank"
                rel="noopener noreferrer"
                class="underline"
              >
                {{ app.social_links.instagram }}
              </a>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Admins</div>
            <div class="text-sm">
              <span v-if="app?.admin_ids">{{ app.admin_ids.length }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Creator</div>
            <div class="text-sm">
              <span v-if="app?.creator_id">{{ app.creator_id }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Created by</div>
            <div class="text-sm">
              <span v-if="app?.created_by">{{ app.created_by }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Created</div>
            <div class="text-sm">
              <span v-if="app?.created_at">set</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Updated</div>
            <div class="text-sm">
              <span v-if="app?.updated_at">set</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const props = defineProps<{ card: AppCard.Card; app?: App | null }>()

const card = toRef(props, 'card')

const app = props.app
</script>
