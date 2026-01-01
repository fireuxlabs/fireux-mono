<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ vmTitle }}</div>
            <div class="text-sm text-dimmed">
              <span v-if="vmSubtitle">{{ vmSubtitle }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
        </div>

        <div v-if="vmBadges.length" class="flex flex-wrap justify-end gap-1">
          <UBadge
            v-for="badge in vmBadges"
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
        <div class="text-xs text-dimmed">Line 1</div>
        <div class="text-sm">
          <span v-if="vmLine1">{{ vmLine1 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Role</div>
        <div class="text-sm">
          <span v-if="vmLine2">{{ vmLine2 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Short name</div>
        <div class="text-sm">
          <span v-if="vmLine3">{{ vmLine3 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="rounded border p-3">
        <div class="text-xs font-medium opacity-70">Details</div>

        <div class="mt-2 grid gap-2">
          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Ecosystem</div>
            <div class="text-sm">
              <span v-if="resolvedApp?.ecosystem">{{ resolvedApp.ecosystem }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Logo</div>
            <div class="text-sm">
              <a
                v-if="vmLogoUrl"
                :href="vmLogoUrl"
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
                v-if="vmWordmarkUrl"
                :href="vmWordmarkUrl"
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
                v-if="vmInstagram"
                :href="`https://instagram.com/${vmInstagram}`"
                target="_blank"
                rel="noopener noreferrer"
                class="underline"
              >
                @{{ vmInstagram }}
              </a>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Admins</div>
            <div class="text-sm">
              <span v-if="resolvedApp?.admin_ids">{{ vmAdminCount }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Creator</div>
            <div class="text-sm">
              <span v-if="vmCreatorId">{{ vmCreatorId }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Created</div>
            <div class="text-sm">
              <span v-if="vmCreatedAt">set</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Updated</div>
            <div class="text-sm">
              <span v-if="vmUpdatedAt">set</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from '../../../../models/core/app.model'
import type { AppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useApp } from '../../../../composables/fireux/firestore/core/app/useApp'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  app?: App | null
  card?: AppInterface.Interface | null
  prop?: string
}>()

const { app: runtimeApp, card: toCard } = useApp()

const resolvedApp = computed<App | null>(() => props.app ?? runtimeApp.value ?? null)

const resolvedCard = computed<AppInterface.Interface | null>(() => {
  if (props.card) return props.card
  const source = resolvedApp.value
  return source ? toCard(source) : null
})

const resolvedTitle = computed(() => resolvedCard.value?.title ?? 'App')
const resolvedSubtitle = computed(() => resolvedCard.value?.subtitle ?? undefined)
const resolvedAvatar = computed(() => resolvedCard.value?.avatar ?? null)
const resolvedBadges = computed(() => resolvedCard.value?.badges ?? [])
const resolvedLine1 = computed(() => {
  if (typeof props.prop === 'string') return props.prop
  return resolvedCard.value?.line1 ?? ''
})
const resolvedLine2 = computed(() => resolvedCard.value?.line2 ?? '')
const resolvedLine3 = computed(() => resolvedCard.value?.line3 ?? '')

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
const vmBadges = computed(() => resolvedBadges.value)
const vmLine1 = computed(() => String(resolvedLine1.value ?? '').trim())
const vmLine2 = computed(() => String(resolvedLine2.value ?? '').trim())
const vmLine3 = computed(() => String(resolvedLine3.value ?? '').trim())

const vmLogoUrl = computed(() => String(resolvedApp.value?.logo_url ?? '').trim())
const vmWordmarkUrl = computed(() =>
  String(resolvedApp.value?.wordmark_url ?? '').trim()
)
const vmInstagram = computed(() =>
  String(resolvedApp.value?.social_links?.instagram ?? '').trim()
)
const vmAdminCount = computed(() => resolvedApp.value?.admin_ids?.length ?? 0)
const vmCreatorId = computed(() => String(resolvedApp.value?.creator_id ?? '').trim())
const vmCreatedAt = computed(() => resolvedApp.value?.created_at ?? null)
const vmUpdatedAt = computed(() => resolvedApp.value?.updated_at ?? null)
</script>
