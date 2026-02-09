<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dummy chef surfaces
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Dummy surfaces for chefs.
          </p>
        </div>
      </div>
    </template>

    <div v-if="pillItems.length" class="flex flex-wrap gap-2">
      <OrganismsProfilesChefCardsPill
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
        <OrganismsProfilesChefCardsPill v-if="selectedCard" v-bind="selectedCard" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <OrganismsProfilesChefCardsCell v-if="selectedCard" v-bind="selectedCard" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <OrganismsProfilesChefCardsPreview v-if="selectedCard" v-bind="selectedCard" />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <OrganismsProfilesChefCardsProfile v-if="selectedCard" :card="selectedCard" />
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
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'
import type { ChefCore } from '../../../models/profiles/Chef/Chef.model'
import type { ChefCard } from '../../../composables/fireux/firestore/profiles/Chef/useChef'

defineOptions({ name: 'DevChefDummy' })

const { card: toCard } = useChef()

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

const pillItems = computed(() =>
  surfaceChefs.value
    .map((surface) => {
      const card = toCard(surface.chef as ChefCore, surface.user ?? null)
      if (!card) return null
      return { chef: surface.chef, card }
    })
    .filter(
      (item): item is { chef: ChefCore; card: NonNullable<ChefCard.Card> } => Boolean(item)
    )
)

const selectedCard = computed(() =>
  selectedChef.value ? toCard(selectedChef.value.chef as ChefCore, selectedChef.value.user ?? null) : null
)
</script>
