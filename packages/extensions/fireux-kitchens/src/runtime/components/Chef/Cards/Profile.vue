<template>
  <article class="mx-auto w-full max-w-6xl space-y-6">
    <PublicProfileHero
      kind-label="Chef"
      icon="i-lucide-chef-hat"
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
    </PublicProfileHero>

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="space-y-6">
        <section
          v-if="aboutCopy"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-utensils"
            eyebrow="Culinary identity"
            title="About"
          />
          <p
            class="mt-5 whitespace-pre-line text-sm leading-7 text-toned sm:text-base"
          >
            {{ aboutCopy }}
          </p>
        </section>

        <section
          v-if="gallery.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
        >
          <div class="flex flex-wrap items-end justify-between gap-3">
            <PublicProfileSectionHeading
              icon="i-lucide-images"
              eyebrow="From the pass"
              title="Selected dishes"
            />
            <UBadge
              :label="`${gallery.length} ${gallery.length === 1 ? 'photo' : 'photos'}`"
              color="neutral"
              variant="soft"
            />
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <figure
              v-for="item in gallery"
              :key="`${item.name}-${item.image_url}`"
              class="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-elevated"
            >
              <img
                :src="item.image_url"
                :alt="item.name || `${card.displayName} dish`"
                loading="lazy"
                class="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <figcaption
                v-if="item.name"
                class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white"
              >
                {{ item.name }}
              </figcaption>
            </figure>
          </div>
        </section>
      </div>

      <aside class="space-y-4 lg:sticky lg:top-24">
        <section
          v-if="signatureDishes.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm"
        >
          <PublicProfileSectionHeading
            compact
            icon="i-lucide-sparkles"
            eyebrow="Known for"
            title="Signature dishes"
          />
          <div class="mt-5 flex flex-wrap gap-2">
            <UBadge
              v-for="dish in signatureDishes"
              :key="dish"
              :label="dish"
              color="neutral"
              variant="soft"
            />
          </div>
        </section>

        <section
          v-if="profile?.chef_organization_name || kitchenCount"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm"
        >
          <PublicProfileSectionHeading
            compact
            icon="i-lucide-store"
            eyebrow="Kitchen network"
            title="At work"
          />
          <p
            v-if="profile?.chef_organization_name"
            class="mt-5 text-sm font-medium text-highlighted"
          >
            {{ profile.chef_organization_name }}
          </p>
          <p v-if="kitchenCount" class="mt-2 text-xs leading-5 text-muted">
            Connected with {{ kitchenCount }}
            {{ kitchenCount === 1 ? 'kitchen' : 'kitchens' }} across the
            network.
          </p>
        </section>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import type { PublicChefProfile } from '../../../models/chef.model'

const props = withDefaults(
  defineProps<{
    card: ChefCard.Card
    profile?: PublicChefProfile | null
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
