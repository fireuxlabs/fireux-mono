<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Profile.vue -->
<template>
  <UCard class="fx-profile">
    <template #header>
      <div class="fx-profile__header">
        <div class="fx-profile__identity">
          <UAvatar :src="avatarUrl" :alt="displayName" size="md" />
          <div class="fx-profile__titles">
            <div class="fx-profile__title">{{ displayName }}</div>
            <div v-if="showSubtitle" class="fx-profile__subtitle">
              <span v-if="ecosystem">{{ ecosystem }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
        </div>

        <div class="fx-profile__badges">
          <div v-if="showWordmark" class="fx-profile__wordmark">
            <AppBrandWordmark
              size="small"
              :light-src="wordmarkLight"
              :dark-src="wordmarkDark"
            />
          </div>

          <template v-if="showMeta">
            <UBadge v-if="role" variant="subtle" color="neutral" size="xs">
              {{ role }}
            </UBadge>
            <UBadge v-if="shortName" variant="subtle" color="neutral" size="xs">
              @{{ shortName }}
            </UBadge>
            <MoleculesMetricBadge
              v-if="typeof userCount === 'number'"
              variant="subtle"
              color="neutral"
              size="xs"
              icon="i-lucide-users"
              :value="userCount"
              label="users"
            />

            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="subtle"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>

            <span v-if="id" class="fx-profile__mono">{{ id }}</span>
          </template>
        </div>
      </div>
    </template>
    <div class="fx-profile__body">
      <section v-if="showTagline && tagline" class="fx-profile__section">
        <div class="fx-profile__label">Tagline</div>
        <div class="fx-profile__value">{{ tagline }}</div>
      </section>

      <section v-if="showDescription" class="fx-profile__section">
        <div class="fx-profile__label">Description</div>
        <div class="fx-profile__value">
          <span v-if="app?.description">{{ app.description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </section>

      <section v-if="showDetails" class="fx-profile__section">
        <div class="fx-profile__label">Details</div>
        <div class="fx-profile__value">
          <div class="fx-profile__kv">
            <div class="fx-profile__k">App ID</div>
            <div class="fx-profile__v">
              <span v-if="app?.id" class="fx-profile__mono">{{ app.id }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="fx-profile__kv">
            <div class="fx-profile__k">Role</div>
            <div class="fx-profile__v">
              <span v-if="app?.role">{{ app.role }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="fx-profile__kv">
            <div class="fx-profile__k">Ecosystem</div>
            <div class="fx-profile__v">
              <span v-if="app?.ecosystem">{{ app.ecosystem }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="fx-profile__kv">
            <div class="fx-profile__k">Creator</div>
            <div class="fx-profile__v">
              <OrganismsUserCardsPill
                v-if="creatorCard"
                v-bind="creatorCard"
                :show-subtitle="false"
              />
              <span v-else-if="app?.creator_id" class="fx-profile__mono">
                {{ app.creator_id }}
              </span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="fx-profile__kv">
            <div class="fx-profile__k">Admins</div>
            <div class="fx-profile__v">
              <div v-if="adminAvatarItems.length" class="fx-profile__adminPreview">
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

              <span v-else class="opacity-70">0</span>
            </div>
          </div>

          <div class="fx-profile__kv">
            <div class="fx-profile__k">Created</div>
            <div class="fx-profile__v">
              <span v-if="createdAtText">{{ createdAtText }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div v-if="showSocials" class="fx-profile__kv">
            <div class="fx-profile__k">Socials</div>
            <div class="fx-profile__v">
              <div class="fx-profile__socials">
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

                <span v-if="!socialItems.length" class="italic opacity-70">missing</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from '#imports'
import type { PropType } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { App } from '../../../../models/core/app.model'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useUserFetch } from '../../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUserInterface } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useSocialLinks, type SocialLinks } from '../../../../composables/fireux/app/ui/useSocialLinks'
import { formatFirestoreTimestamp } from '../../../../utils/formatTimestamp'
import type { User } from '../../../../models/core/user.model'

const props = defineProps({
  app: { type: Object as PropType<App | null>, default: null },

  id: { type: String, default: '' },
  shortName: { type: String, default: '' },
  role: { type: String, default: '' },
  userCount: { type: Number as PropType<number | null>, default: null },
  tagline: { type: String, default: '' },
  wordmarkLight: { type: String, default: '' },
  wordmarkDark: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  displayName: { type: String, default: '' },
  ecosystem: { type: String, default: '' },
  badges: { type: Array as PropType<string[]>, default: () => [] },
  socialLinks: { type: Object as PropType<SocialLinks | null>, default: null },

  showSubtitle: { type: Boolean, default: true },
  showTagline: { type: Boolean, default: true },
  showMeta: { type: Boolean, default: true },
  showWordmark: { type: Boolean, default: true },
  showDescription: { type: Boolean, default: true },
  showDetails: { type: Boolean, default: true },
  showSocials: { type: Boolean, default: true },
})

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