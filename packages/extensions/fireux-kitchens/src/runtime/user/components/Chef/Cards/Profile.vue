<template>
  <article class="public-profile-detail" data-profile-tone="chef">
    <UserProfileHero
      kind-label="Chef"
      icon="i-lucide-chef-hat"
      tone="warning"
      :avatar-url="card.imageUrl || card.avatarUrl"
      :display-name="card.displayName || 'Chef profile'"
      :handle="card.handle"
      :subtitle="profile?.chef_organization_name"
      :title="card.title"
      :summary="heroSummary"
      :labels="signatureDishes"
      :stats="profileStats"
    >
      <template #actions>
        <slot name="actions" />
      </template>
    </UserProfileHero>

    <div class="public-profile-detail__content">
      <div class="public-profile-detail__main">
        <UserProfileSection
          v-if="aboutCopy"
          icon="i-lucide-utensils"
          eyebrow="Culinary identity"
          title="About"
        >
          <p
            class="whitespace-pre-line text-sm leading-7 text-toned sm:text-base"
          >
            {{ aboutCopy }}
          </p>
        </UserProfileSection>

        <UserProfileSection
          v-if="gallery.length"
          icon="i-lucide-images"
          eyebrow="From the pass"
          title="Selected dishes"
        >
          <template #meta>
            <UBadge
              :label="`${gallery.length} ${gallery.length === 1 ? 'photo' : 'photos'}`"
              color="neutral"
              variant="soft"
            />
          </template>

          <div class="grid gap-3 sm:grid-cols-2">
            <figure
              v-for="item in gallery"
              :key="`${item.name}-${item.image_url}`"
              class="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-elevated"
            >
              <img
                :src="item.image_url"
                :alt="item.name || `${card.displayName} dish`"
                loading="lazy"
                decoding="async"
                width="960"
                height="720"
                class="size-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
              />
              <figcaption
                v-if="item.name"
                class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white"
              >
                {{ item.name }}
              </figcaption>
            </figure>
          </div>
        </UserProfileSection>
      </div>

      <aside class="public-profile-detail__sidebar">
        <UserProfileSection
          v-if="signatureDishes.length"
          compact
          icon="i-lucide-sparkles"
          eyebrow="Known for"
          title="Signature dishes"
        >
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="dish in signatureDishes"
              :key="dish"
              :label="dish"
              color="neutral"
              variant="soft"
            />
          </div>
        </UserProfileSection>

        <UserProfileSection
          v-if="profile?.chef_organization_name || kitchenCount"
          compact
          icon="i-lucide-store"
          eyebrow="Kitchen network"
          title="At work"
        >
          <p
            v-if="profile?.chef_organization_name"
            class="text-sm font-medium text-highlighted"
          >
            {{ profile.chef_organization_name }}
          </p>
          <p v-if="kitchenCount" class="mt-2 text-xs leading-5 text-muted">
            Connected with {{ kitchenCount }}
            {{ kitchenCount === 1 ? 'kitchen' : 'kitchens' }} across the
            network.
          </p>
        </UserProfileSection>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../composables/chef/useChefInterface'
import type { ChefProfile } from '../../../utils/chef.ts'

const props = withDefaults(
  defineProps<{
    card: ChefCard.Card
    profile?: ChefProfile | null
    prop?: string
  }>(),
  {
    profile: null,
    prop: '',
  }
)

const cleanList = (values: unknown) =>
  Array.isArray(values)
    ? values.map((value) => String(value || '').trim()).filter(Boolean)
    : []

const heroSummary = computed(() =>
  String(
    props.prop || props.card.summary || props.profile?.summary || ''
  ).trim()
)
const aboutCopy = computed(() => {
  const bio = String(props.profile?.chef_bio || '').trim()
  return bio && bio !== heroSummary.value ? bio : ''
})
const signatureDishes = computed(() =>
  cleanList(props.profile?.chef_signature_dishes)
)
const gallery = computed(() => props.profile?.chef_gallery ?? [])
const kitchenCount = computed(
  () => cleanList(props.profile?.kitchen_ids).length
)
const profileStats = computed(() => [
  {
    label: 'Signature dishes',
    value: signatureDishes.value.length,
    icon: 'i-lucide-sparkles',
  },
  {
    label: 'Dish photos',
    value: gallery.value.length,
    icon: 'i-lucide-images',
  },
  {
    label: 'Kitchens',
    value: kitchenCount.value,
    icon: 'i-lucide-store',
  },
])
</script>
