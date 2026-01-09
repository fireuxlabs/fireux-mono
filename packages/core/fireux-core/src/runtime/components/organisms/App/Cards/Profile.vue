<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Profile.vue -->
<template>
  <UCard class="fx-card">
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <UAvatar :src="avatarUrl" :alt="displayName" size="md" />

          <div class="min-w-0">
            <div class="truncate text-lg font-semibold leading-6">{{ displayName }}</div>
          </div>
        </div>

        <div v-if="showWordmark" class="shrink-0">
          <AppBrandWordmark
            size="small"
            :light-src="wordmarkLight"
            :dark-src="wordmarkDark"
          />
        </div>
      </div>
    </template>

    <div class="space-y-5">
      <div class="space-y-2">
        <div v-if="showSubtitle" class="text-sm text-dimmed">
          <span v-if="ecosystem">{{ ecosystem }}</span>
          <span v-else class="italic">missing</span>
        </div>

        <div v-if="showTagline && tagline" class="text-sm text-dimmed line-clamp-2">
          {{ tagline }}
        </div>

        <div v-if="showMeta" class="flex flex-wrap items-center gap-2">
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

          <UBadge
            v-for="badge in badges"
            :key="badge"
            variant="subtle"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>

          <span v-if="id" class="text-xs text-dimmed font-mono break-all">
            {{ id }}
          </span>
        </div>
      </div>

      <div v-if="showDescription" class="space-y-1">
        <div class="text-xs text-dimmed">Description</div>
        <div class="text-sm">
          <span v-if="app?.description">{{ app.description }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div v-if="showDetails" class="rounded border p-4 space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">App ID</div>
          <div class="text-sm font-mono break-all">
            <span v-if="app?.id">{{ app.id }}</span>
            <span v-else class="text-dimmed">missing</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Role</div>
          <div class="text-sm">
            <span v-if="app?.role">{{ app.role }}</span>
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
          <div class="text-xs text-dimmed">Creator</div>
          <div class="text-sm text-right">
            <OrganismsUserCardsPill
              v-if="creatorCard"
              v-bind="creatorCard"
              :show-subtitle="false"
            />
            <span v-else-if="app?.creator_id" class="font-mono break-all">
              {{ app.creator_id }}
            </span>
            <span v-else class="text-dimmed">missing</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Admins</div>
          <div class="text-sm">
            <NuxtLink
              v-if="app?.admin_ids?.length"
              :to="adminUsersLink"
              class="text-primary hover:underline"
            >
              {{ app.admin_ids.length }}
            </NuxtLink>
            <span v-else class="text-dimmed">0</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Join requests</div>
          <div class="text-sm">
            <span v-if="app?.join_requests?.length">{{ app.join_requests.length }}</span>
            <span v-else class="text-dimmed">0</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Created</div>
          <div class="text-sm">
            <span v-if="createdAtText">{{ createdAtText }}</span>
            <span v-else class="text-dimmed">missing</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Updated</div>
          <div class="text-sm">
            <span v-if="updatedAtText">{{ updatedAtText }}</span>
            <span v-else class="text-dimmed">missing</span>
          </div>
        </div>

        <div v-if="showSocials" class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Socials</div>
          <div class="flex flex-wrap justify-end gap-2">
            <a
              v-for="item in socialItems"
              :key="item.platform"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center"
              :title="item.platform"
              :aria-label="item.platform"
            >
              <Icon :name="item.icon" mode="svg" class="size-5" />
            </a>

            <span v-if="!socialItems.length" class="text-sm text-dimmed italic">
              missing
            </span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useSocialLinks } from '../../../../composables/fireux/app/ui/useSocialLinks'
import { formatFirestoreTimestamp } from '../../../../utils/formatTimestamp'

const props = withDefaults(
  defineProps<
    { app?: App | null } &
      Pick<
        AppCard.Card,
        | 'id'
        | 'shortName'
        | 'role'
        | 'userCount'
        | 'tagline'
        | 'wordmarkLight'
        | 'wordmarkDark'
        | 'avatarUrl'
        | 'displayName'
        | 'ecosystem'
        | 'badges'
        | 'socialLinks'
      > & {
        creatorCard?: UserCard.Card | null
        showSubtitle?: boolean
        showTagline?: boolean
        showMeta?: boolean
        showWordmark?: boolean
        showDescription?: boolean
        showDetails?: boolean
        showSocials?: boolean
      }
  >(),
  {
    creatorCard: null,
    showSubtitle: true,
    showTagline: true,
    showMeta: true,
    showWordmark: true,
    showDescription: true,
    showDetails: true,
    showSocials: true,
  }
)

const { toItems } = useSocialLinks()
const socialItems = computed(() => toItems(props.socialLinks))

const createdAtText = computed(() =>
  formatFirestoreTimestamp(props.app?.created_at, { fallback: undefined })
)

const updatedAtText = computed(() =>
  formatFirestoreTimestamp(props.app?.updated_at, { fallback: undefined })
)

const adminUsersLink = computed(() => ({
  path: '/misebox/users',
  query: { filter: 'admins' },
}))
</script>