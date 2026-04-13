<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Profile.vue -->
<template>
  <UCard class="profile">
    <template #header>
      <div class="profile__header">
        <div class="profile__identity">
          <UAvatar :src="thumbnailUrl || undefined" :alt="displayName" size="md" />
          <div class="profile__titles">
            <div class="profile__title">{{ displayName }}</div>
            <div v-if="showSubtitle" class="profile__subtitle">
              <span v-if="ecosystem">{{ ecosystem }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
        </div>

        <div class="profile__badges">
          <div v-if="showWordmark" class="profile__wordmark">
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

            <span v-if="id" class="profile__mono">{{ id }}</span>
          </template>
        </div>
      </div>
    </template>
    <div class="profile__body">
      <section v-if="showTagline && tagline" class="profile__section">
        <div class="profile__label">Tagline</div>
        <div class="profile__value">{{ tagline }}</div>
      </section>

      <section v-if="showDescription" class="profile__section">
        <div class="profile__label">Description</div>
        <div class="profile__value">
          <span v-if="app?.description">{{ app.description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </section>

      <section v-if="showDetails" class="profile__section">
        <div class="profile__label">Details</div>
        <div class="profile__value">
          <div class="profile__kv">
            <div class="profile__k">App ID</div>
            <div class="profile__v">
              <span v-if="app?.id" class="profile__mono">{{ app.id }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Role</div>
            <div class="profile__v">
              <span v-if="app?.role">{{ app.role }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Ecosystem</div>
            <div class="profile__v">
              <span v-if="app?.ecosystem">{{ app.ecosystem }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Creator</div>
            <div class="profile__v">
              <UserCardsPill
                v-if="creatorCard"
                v-bind="creatorCard"
                :show-subtitle="false"
                :link="Boolean(creatorCard.to)"
                class="block"
              />
              <span v-else-if="creatorId" class="profile__mono">
                {{ creatorId }}
              </span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Admins</div>
            <div class="profile__v">
              <div v-if="adminAvatarItems.length" class="profile__adminPreview">
                <UAvatarGroup :max="3" size="xs">
                  <UTooltip
                    v-for="item in adminAvatarItems"
                    :key="item.id"
                    :text="item.tooltip"
                  >
                    <template v-if="item.to">
                      <ULink :to="item.to" raw class="hover:ring-primary transition rounded-full">
                        <UAvatar
                          :src="item.avatarUrl || undefined"
                          :alt="item.alt"
                        />
                      </ULink>
                    </template>
                    <template v-else>
                      <UAvatar
                        :src="item.avatarUrl || undefined"
                        :alt="item.alt"
                      />
                    </template>
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

          <div class="profile__kv">
            <div class="profile__k">Created</div>
            <div class="profile__v">
              <span v-if="createdAtText">{{ createdAtText }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div v-if="showSocials" class="profile__kv">
            <div class="profile__k">Socials</div>
            <div class="profile__v">
              <div class="profile__socials">
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
import { doc, getDoc } from 'firebase/firestore'
import type { PropType } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useSocialLinks, type SocialLinks } from '../../../../composables/fireux/app/ui/useSocialLinks'
import { useUserFetch } from '../../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useUserInterface } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { AppModel } from '../../../../models/core/app.model'
import type { User } from '../../../../models/core/user.model'
import { formatFirestoreTimestamp } from '../../../../utils/formatTimestamp'

const props = defineProps({
  app: { type: Object as PropType<AppModel | null>, default: null },

  id: { type: String, default: '' },
  shortName: { type: String, default: '' },
  role: { type: String, default: '' },
  userCount: { type: Number as PropType<number | null>, default: null },
  tagline: { type: String, default: '' },
  wordmarkLight: { type: String, default: '' },
  wordmarkDark: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
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
  formatFirestoreTimestamp(props.app?.created?.at, {
    fallback: undefined,
    format: { dateStyle: 'medium' },
  })
)

const creatorId = computed(() => {
  const raw = props.app?.created?.by
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null
})
const { user: creatorUser } = useUserFetch(creatorId)
const { pill: userToCard } = useUserInterface()

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
      to: card?.to ?? '',
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
