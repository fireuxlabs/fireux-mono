<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Profile.vue -->
<template>
  <UCard class="profile">
    <template #header>
      <div class="profile__header">
        <div class="profile__identity">
          <UAvatar
            :src="card.thumbnailUrl || undefined"
            :text="card.avatarText || undefined"
            :alt="card.displayName"
            size="md"
          />
          <div class="profile__titles">
            <div class="profile__title">{{ card.displayName }}</div>
            <div v-if="showSubtitle" class="profile__subtitle">
              <span v-if="card.ecosystem">{{ card.ecosystem }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
        </div>

        <div class="profile__badges">
          <div v-if="showWordmark" class="profile__wordmark">
            <AppBrandWordmark
              size="small"
              :light-src="card.wordmarkLightUrl"
              :dark-src="card.wordmarkDarkUrl"
            />
          </div>

          <template v-if="showMeta">
            <UBadge
              v-if="model.role"
              variant="subtle"
              color="neutral"
              size="xs"
            >
              {{ model.role }}
            </UBadge>
            <UBadge
              v-if="card.shortName"
              variant="subtle"
              color="neutral"
              size="xs"
            >
              @{{ card.shortName }}
            </UBadge>
            <MoleculesMetricBadge
              v-if="typeof card.userCount === 'number'"
              variant="subtle"
              color="neutral"
              size="xs"
              icon="i-lucide-users"
              :value="card.userCount"
              label="users"
            />

            <UBadge
              v-for="badge in card.badges"
              :key="badge"
              variant="subtle"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>

            <span v-if="model.appId" class="profile__mono">{{
              model.appId
            }}</span>
          </template>
        </div>
      </div>
    </template>

    <div class="profile__body">
      <section v-if="showTagline && card.tagline" class="profile__section">
        <div class="profile__label">Tagline</div>
        <div class="profile__value">{{ card.tagline }}</div>
      </section>

      <section v-if="showDescription" class="profile__section">
        <div class="profile__label">Description</div>
        <div class="profile__value">
          <span v-if="model.description">{{ model.description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </section>

      <section v-if="showDetails" class="profile__section">
        <div class="profile__label">Details</div>
        <div class="profile__value">
          <div class="profile__kv">
            <div class="profile__k">App ID</div>
            <div class="profile__v">
              <span v-if="model.appId" class="profile__mono">
                {{ model.appId }}
              </span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Role</div>
            <div class="profile__v">
              <span v-if="model.role">{{ model.role }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Ecosystem</div>
            <div class="profile__v">
              <span v-if="model.ecosystem">{{ model.ecosystem }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Creator</div>
            <div class="profile__v">
              <UserCardsPill
                v-if="model.creatorCard"
                v-bind="model.creatorCard"
                :show-subtitle="false"
                :link="Boolean(model.creatorCard.to)"
                class="block"
              />
              <span v-else-if="model.creatorId" class="profile__mono">
                {{ model.creatorId }}
              </span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Admins</div>
            <div class="profile__v">
              <div
                v-if="model.adminAvatarItems.length"
                class="profile__adminPreview"
              >
                <UAvatarGroup :max="3" size="xs">
                  <UTooltip
                    v-for="item in model.adminAvatarItems"
                    :key="item.id"
                    :text="item.tooltip"
                  >
                    <template v-if="item.to">
                      <ULink
                        :to="item.to"
                        raw
                        class="hover:ring-primary transition rounded-full"
                      >
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
                  v-if="model.adminCount"
                  :to="adminUsersLink"
                  class="text-primary hover:underline"
                >
                  {{ model.adminCount }}
                </NuxtLink>
              </div>

              <NuxtLink
                v-else-if="model.adminCount"
                :to="adminUsersLink"
                class="text-primary hover:underline"
              >
                {{ model.adminCount }}
              </NuxtLink>

              <span v-else class="opacity-70">0</span>
            </div>
          </div>

          <div class="profile__kv">
            <div class="profile__k">Created</div>
            <div class="profile__v">
              <span v-if="model.createdAtText">{{ model.createdAtText }}</span>
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

                <span v-if="!socialItems.length" class="italic opacity-70">
                  missing
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import {
  useSocialLinks,
  type SocialLinks,
} from '../../../../composables/fireux/app/ui/useSocialLinks'
import type { AppProfileViewModel } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'

const props = defineProps<{
  model: AppProfileViewModel
  showSubtitle?: boolean
  showTagline?: boolean
  showMeta?: boolean
  showWordmark?: boolean
  showDescription?: boolean
  showDetails?: boolean
  showSocials?: boolean
}>()

const showSubtitle = computed(() => props.showSubtitle ?? true)
const showTagline = computed(() => props.showTagline ?? true)
const showMeta = computed(() => props.showMeta ?? true)
const showWordmark = computed(() => props.showWordmark ?? true)
const showDescription = computed(() => props.showDescription ?? true)
const showDetails = computed(() => props.showDetails ?? true)
const showSocials = computed(() => props.showSocials ?? true)

const model = computed(() => props.model)
const card = computed(() => model.value.card)

const { toItems } = useSocialLinks()
const socialItems = computed(() =>
  toItems((card.value.socialLinks ?? {}) as SocialLinks)
)

const adminUsersLink = computed(() => ({
  path: `/apps/${card.value.id}`,
  hash: '#users',
  query: { filter: 'admins' },
}))
</script>
