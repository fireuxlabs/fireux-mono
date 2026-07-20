<template>
  <UCard class="profile">
    <template #header>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex min-w-0 items-center gap-4">
          <UAvatar
            :src="card.thumbnailUrl || undefined"
            :text="card.avatarText || undefined"
            :alt="card.displayName"
            size="lg"
            class="shrink-0"
          />

          <div class="min-w-0 space-y-2">
            <div class="space-y-1">
              <div class="truncate text-lg font-semibold text-default">
                {{ card.displayName || 'Untitled app' }}
              </div>

              <div
                v-if="showSubtitle"
                class="flex flex-wrap items-center gap-2 text-sm text-dimmed"
              >
                <span v-if="model.ecosystem">{{ model.ecosystem }}</span>
                <span v-if="model.ecosystem && model.role">•</span>
                <span v-if="model.role">{{ model.role }}</span>
                <span v-if="!model.ecosystem && !model.role" class="italic">
                  missing
                </span>
              </div>
            </div>

            <div v-if="showMeta" class="flex flex-wrap items-center gap-2">
              <UBadge
                v-if="card.shortName"
                variant="soft"
                color="neutral"
                size="xs"
              >
                @{{ card.shortName }}
              </UBadge>

              <MoleculesMetricBadge
                v-if="typeof card.userCount === 'number'"
                icon="i-lucide-users"
                :value="card.userCount"
                label="users"
                size="xs"
                variant="soft"
                color="neutral"
              />

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
        </div>

        <div class="flex flex-wrap items-center gap-3 sm:justify-end">
          <div v-if="showWordmark" class="max-w-[160px]">
            <AppBrandWordmark
              size="small"
              :light-src="card.wordmarkLightUrl"
              :dark-src="card.wordmarkDarkUrl"
            />
          </div>

          <div v-if="primaryWebsite" class="flex items-center gap-2">
            <UButton
              :to="primaryWebsite"
              target="_blank"
              rel="noopener noreferrer"
              icon="i-lucide-external-link"
              size="sm"
              color="neutral"
              variant="soft"
            >
              Visit app
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <section
        v-if="showTagline && card.tagline"
        class="rounded-2xl border border-default bg-muted/30 p-4"
      >
        <div class="fx-type-label">
          Tagline
        </div>
        <div class="mt-2 text-base text-default">
          {{ card.tagline }}
        </div>
      </section>

      <section v-if="showDescription" class="space-y-2">
        <div class="fx-type-label">
          Description
        </div>
        <div class="text-sm leading-6 text-toned">
          <span v-if="model.description">{{ model.description }}</span>
          <span v-else class="italic">No description yet.</span>
        </div>
      </section>

      <section
        v-if="showDetails"
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="item in detailCards"
          :key="item.label"
          class="rounded-2xl border border-default p-4"
        >
          <div class="fx-type-label">
            {{ item.label }}
          </div>
          <div
            :class="[
              'mt-2 text-sm text-default',
              item.mono ? 'break-all font-mono' : '',
            ]"
          >
            {{ item.value }}
          </div>
        </div>
      </section>

      <section v-if="showPeople" class="grid gap-4">
        <div class="rounded-2xl border border-default p-4 space-y-3">
          <div class="fx-type-label">
            Creator
          </div>

          <UserCardsPill
            v-if="model.creatorCard"
            v-bind="model.creatorCard"
            :show-subtitle="false"
            :link="Boolean(model.creatorCard.to)"
            class="block"
          />

          <div v-else-if="model.creatorId" class="font-mono text-sm text-dimmed">
            {{ model.creatorId }}
          </div>

          <div v-else class="text-sm italic text-dimmed">
            No creator recorded.
          </div>
        </div>

      </section>

      <section v-if="showSocials" class="space-y-3">
        <div class="fx-type-label">
          Links
        </div>

        <div v-if="socialItems.length" class="flex flex-wrap items-center gap-2">
          <UButton
            v-for="item in socialItems"
            :key="item.platform"
            :to="item.url"
            target="_blank"
            rel="noopener noreferrer"
            :icon="item.icon"
            size="sm"
            color="neutral"
            variant="soft"
          >
            {{ item.platform }}
          </UButton>
        </div>

        <div v-else class="text-sm italic text-dimmed">
          No links available.
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
} from '../../../composables/fireux/app/ui/useSocialLinks'
import type { AppProfileViewModel } from '../../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'

const props = withDefaults(
  defineProps<{
    model: AppProfileViewModel
    showSubtitle?: boolean
    showTagline?: boolean
    showMeta?: boolean
    showWordmark?: boolean
    showDescription?: boolean
    showDetails?: boolean
    showSocials?: boolean
    showPeople?: boolean
  }>(),
  {
    showSubtitle: true,
    showTagline: true,
    showMeta: true,
    showWordmark: true,
    showDescription: true,
    showDetails: true,
    showSocials: true,
    showPeople: true,
  }
)

const model = computed(() => props.model)
const card = computed(() => model.value.card)

const showSubtitle = computed(() => props.showSubtitle)
const showTagline = computed(() => props.showTagline)
const showMeta = computed(() => props.showMeta)
const showWordmark = computed(() => props.showWordmark)
const showDescription = computed(() => props.showDescription)
const showDetails = computed(() => props.showDetails)
const showSocials = computed(() => props.showSocials)
const showPeople = computed(() => props.showPeople)

const { toItems } = useSocialLinks()
const socialItems = computed(() =>
  toItems((card.value.socialLinks ?? {}) as SocialLinks)
)

const primaryWebsite = computed(() =>
  String(card.value.socialLinks?.website || '').trim()
)

const detailCards = computed(() => [
  {
    label: 'App ID',
    value: model.value.appId || 'missing',
    mono: true,
  },
  {
    label: 'Created',
    value: model.value.createdAtText || 'missing',
    mono: false,
  },
])
</script>
