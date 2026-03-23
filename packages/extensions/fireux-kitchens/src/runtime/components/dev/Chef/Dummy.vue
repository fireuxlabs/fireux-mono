<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dummy surfaces for chefs
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Dummy surfaces for chefs.
          </p>
        </div>
      </div>
    </template>

    <div v-if="pillItems.length" class="flex flex-wrap gap-2">
      <ProfilesChefCardsPill
        v-for="item in pillItems"
        :key="item.chef.id"
        v-bind="item.card"
        action
        @action="selectChef(item.chef)"
      />
    </div>

    <div v-if="pillItems.length" class="space-y-4">
      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <ProfilesChefCardsPill v-if="selectedCard" v-bind="selectedCard" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <ProfilesChefCardsCell v-if="selectedCard" v-bind="selectedCard" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <ProfilesChefCardsPreview v-if="selectedCard" v-bind="selectedCard" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <ProfilesChefCardsProfile v-if="selectedCard" :card="selectedCard" :profile="selectedChef?.chef ?? null" />
      </div>
    </div>

    <UCard v-else variant="subtle">
      <p class="text-sm text-dimmed">
        No chef samples available yet. Add entries to `dummy/chef.dummy.ts`.
      </p>
    </UCard>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { dummyChefSurfaceList } from '../../../../../../../../dummy/chef.dummy'
import type { ChefCard } from '../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import { useChefInterface } from '../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import type { ChefCore } from '../../../models/profiles/Chef/Chef.model'

defineOptions({ name: 'DevChefDummy' })

const { interface: toCard } = useChefInterface()

type ChefSurface = (typeof dummyChefSurfaceList)[number]

const surfaceChefs = computed<ChefSurface[]>(() => dummyChefSurfaceList ?? [])
const selectedId = ref('')

watch(
  surfaceChefs,
  (next) => {
    if (!next.length) {
      selectedId.value = ''
      return
    }
    if (!selectedId.value || !next.some((item) => String(item.chef.id) === selectedId.value)) {
      selectedId.value = String(next[0]?.chef.id ?? '')
    }
  },
  { immediate: true }
)

const selectedChef = computed(() =>
  surfaceChefs.value.find((surface) => String(surface.chef.id) === selectedId.value) ?? null
)

const selectChef = (chef: ChefCore) => {
  selectedId.value = String(chef.id)
}

type ChefCardUser = Parameters<typeof toCard>[1]

const toUserLike = (
  user: (typeof dummyChefSurfaceList)[number]['user'] | null | undefined
): ChefCardUser => {
  if (!user) return null
  return {
    display_name: String((user as any).display_name ?? ''),
    avatar: String((user as any).avatar ?? ''),
    id: (user as any).id,
    handle: (user as any).handle,
    email: (user as any).email,
  } as ChefCardUser
}

const pillItems = computed(() =>
  surfaceChefs.value
    .map((surface) => {
      const card = toCard(surface.chef as ChefCore, toUserLike(surface.user))
      if (!card) return null
      return { chef: surface.chef, card }
    })
    .filter(
      (item): item is { chef: ChefCore; card: NonNullable<ChefCard.Card> } => Boolean(item)
    )
)

const selectedCard = computed(() =>
  selectedChef.value
    ? toCard(selectedChef.value.chef as ChefCore, toUserLike(selectedChef.value.user))
    : null
)
</script>
