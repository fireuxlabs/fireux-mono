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

      <div v-if="showDetails" class="rounded p-4 space-y-3">
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
            <div v-if="adminAvatarItems.length" class="flex items-center justify-end gap-2">
              <UAvatarGroup :max="3" size="xs">
                <UTooltip
                  v-for="item in adminAvatarItems"
                  :key="item.id"
                  :text="item.tooltip"
                >
                  <ULink :to="item.to" raw class="hover:ring-primary transition rounded-full">
                    <UAvatar
                      :src="item.avatarUrl || undefined"
                      :alt="item.alt"
                    />
                  </ULink>
                </UTooltip>
              </UAvatarGroup>

              <NuxtLink
                v-if="app?.admin_ids?.length"
                :to="adminUsersLink"
                class="text-primary hover:underline"
              >
                {{ app.admin_ids.length }}
              </NuxtLink>
            </div>

            <NuxtLink
              v-else-if="app?.admin_ids?.length"
              :to="adminUsersLink"
              class="text-primary hover:underline"
            >
              {{ app.admin_ids.length }}
            </NuxtLink>

            <span v-else class="text-dimmed">0</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-dimmed">Created</div>
          <div class="text-sm inline-flex items-center justify-end gap-2">
            <UIcon name="i-lucide-calendar" class="size-4 text-dimmed shrink-0" />
            <span v-if="createdAtText">{{ createdAtText }}</span>
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
import { computed, ref, watch } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useUserFetch } from '../../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUserInterface } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useSocialLinks } from '../../../../composables/fireux/app/ui/useSocialLinks'
import { formatFirestoreTimestamp } from '../../../../utils/formatTimestamp'
import type { User } from '../../../../models/core/user.model'

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
  formatFirestoreTimestamp(props.app?.created_at, {
    fallback: undefined,
    format: { dateStyle: 'medium' },
  })
)

const creatorId = computed(() => props.app?.creator_id ?? null)
const { user: creatorUser } = useUserFetch(creatorId)
const { card: userToCard } = useUserInterface()

const creatorCard = computed(() => userToCard(creatorUser.value))

const adminIds = computed(() => {
  const raw = props.app?.admin_ids
  if (!Array.isArray(raw)) return []
  return raw.filter((v): v is string => typeof v === 'string' && v.length > 0)
})

const adminPreviewIds = computed(() => adminIds.value.slice(0, 3))

const db = useFirestore()
const adminPreviewCards = ref<UserCard.Card[]>([])

type AdminAvatarItem = {
  id: string
  to: string
  avatarUrl: string
  alt: string
  tooltip: string
}

const adminAvatarItems = computed<AdminAvatarItem[]>(() => {
  return adminPreviewIds.value.map((id: string) => {
    const card = adminPreviewCards.value.find((c: UserCard.Card) => c.id === id)

    const displayName = (card?.displayName ?? '').trim()
    const handle = (card?.handle ?? '').trim()
    return {
      id,
      to: card?.to ?? `/users/${id}`,
      avatarUrl: card?.avatarUrl ?? '',
      alt: displayName || handle || id,
      tooltip: displayName || handle || id,
    }
  })
})

function normalizeUser(raw: any, fallbackId: string): User {
  return {
    ...raw,
    id: raw?.id ?? fallbackId,
    display_name: raw?.display_name ?? raw?.id ?? fallbackId,
    avatar: raw?.avatar ?? '',
    handle: raw?.handle ?? '',
    email: raw?.email ?? '',
    bio: raw?.bio ?? '',
    profiles: Array.isArray(raw?.profiles) ? raw.profiles : [],
    userOf: Array.isArray(raw?.userOf) ? raw.userOf : [],
    adminOf: Array.isArray(raw?.adminOf) ? raw.adminOf : [],
  }
}

watch(
  adminPreviewIds,
  async (ids: string[]) => {
    adminPreviewCards.value = []

    if (import.meta.server) return
    if (!ids.length) return

    const token = Symbol('fetch')
    ;(watch as any)._appProfileAdminsToken = token

    try {
      const snapshots = await Promise.all(
        ids.map((id: string) => getDoc(doc(db, 'users', id) as any))
      )

      if ((watch as any)._appProfileAdminsToken !== token) return

      adminPreviewCards.value = snapshots
        .filter((snap) => snap.exists())
        .map((snap) => normalizeUser(snap.data(), snap.id))
        .map((u) => userToCard(u)!)
        .filter(Boolean)
    } catch {
      // If security rules block reads, keep id-based avatars.
      if ((watch as any)._appProfileAdminsToken === token) {
        adminPreviewCards.value = []
      }
    }
  },
  { immediate: true }
)

const adminUsersLink = computed(() => ({
  path: `/apps/${props.id}`,
  hash: '#users',
  query: { filter: 'admins' },
}))
</script>