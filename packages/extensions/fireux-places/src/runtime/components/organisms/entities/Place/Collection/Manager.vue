<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Places</div>

        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No places yet.
    </div>

    <div v-else>
      <div
        v-if="variant === 'pill'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <template v-for="card in cards" :key="card.id">
          <div class="space-y-2">
            <div
              class="rounded-[16px]"
              :class="highlightClass(card.id)"
            >
              <NuxtLink :to="placeLink(card.id, card.to)" class="block">
                <PlaceCardsPill v-bind="card" :link="false" class="block" />
              </NuxtLink>
            </div>
            <div class="flex justify-end">
              <UButton
                size="xs"
                color="red"
                variant="soft"
                :loading="deletingId === card.id"
                :disabled="deletingId === card.id"
                @click.stop="deletePlace(card.id)"
              >
                Delete
              </UButton>
            </div>
          </div>
        </template>
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <template v-for="card in cards" :key="card.id">
          <div class="space-y-2">
            <div
              class="rounded-[16px]"
              :class="highlightClass(card.id)"
            >
              <NuxtLink :to="placeLink(card.id, card.to)" class="block">
                <PlaceCardsCell v-bind="card" :link="false" class="block" />
              </NuxtLink>
            </div>
            <div class="flex justify-end">
              <UButton
                size="xs"
                color="red"
                variant="soft"
                :loading="deletingId === card.id"
                :disabled="deletingId === card.id"
                @click.stop="deletePlace(card.id)"
              >
                Delete
              </UButton>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Places (JSON)'"
        :data="debugPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager';
import { computed, ref } from 'vue';
import { usePlacesInterface } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';
import type { BasePlace } from '../../../../../models/objects/place.model';

const props = defineProps<{ collection?: BasePlace[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = usePlacesInterface()
const cards = computed(() =>
  collection.value
    .map((place) => makeCard(place))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)
const highlightId = 'ChIJo2ga-cKxe0gRgPNUy3HSpxM'
const highlightClass = (id: string) =>
  id === highlightId
    ? 'ring-2 ring-amber-400/80 bg-amber-100/40'
    : 'ring-1 ring-transparent'
const placeLink = (id: string, to?: string) =>
  to && to.length ? to : `/places/${encodeURIComponent(id)}`
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalPlaces: collection.value.length,
  places: collection.value,
}))

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('cell')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

const { deleteDocument } = useFirestoreManager()
const deletingId = ref<string | null>(null)

async function deletePlace(id: string) {
  if (!id || deletingId.value) return
  const confirmed =
    typeof window === 'undefined'
      ? false
      : window.confirm(`Delete place ${id}?`)
  if (!confirmed) return
  deletingId.value = id
  try {
    await deleteDocument('places', id)
  } finally {
    deletingId.value = null
  }
}

</script>
