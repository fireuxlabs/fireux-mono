<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Focus</div>
            <p class="console-card-header__description">
              Selected kitchen in the console.
            </p>
          </div>
        </template>

        <div v-if="focus.hasSelection" class="space-y-4">
          <KitchenCardsPill
            v-if="focusCard"
            v-bind="focusCard"
            :link="false"
            :show-badges="false"
          />

          <div class="console-summary-grid">
            <div class="console-summary-field">
              Mode:
              <span class="console-summary-value">{{ focusModeLabel }}</span>
            </div>
            <div class="console-summary-field">
              Kitchen ID:
              <span class="console-summary-value">{{ focus.id }}</span>
            </div>
            <div class="console-summary-field">
              Kitchens in Scope:
              <span class="console-summary-value">{{ groupCountLabel }}</span>
            </div>
          </div>
        </div>

        <p v-else class="console-card-header__description">
          No kitchen is currently selected.
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">All</div>
            <p class="console-card-header__description">
              Your live kitchens available in this console.
            </p>
          </div>
        </template>

        <div class="console-focus">
          <div class="console-focus__title">
            All Kitchens
          </div>

          <div class="console-metric">
            <div class="console-metric__value">
              {{ groupCountLabel }}
            </div>
            <div class="console-metric__label">Kitchens</div>
          </div>

          <p class="console-card-header__description">
            Live kitchens available in your current workspace scope.
          </p>
        </div>

        <div v-if="groupCards.length" class="mt-4 space-y-2">
          <KitchenCardsPill
            v-for="card in groupCards"
            :key="card.id"
            v-bind="card"
            :link="false"
            :show-badges="false"
          />
        </div>

        <p v-else class="mt-4 console-card-header__description">
          No live kitchens are currently in scope.
        </p>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsoleOverview } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleOverview'

type DemoKitchenListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

type KitchenPillCard = NonNullable<
  ReturnType<ReturnType<typeof useKitchenInterface>['pill']>
>

type KitchenPillInput = Exclude<
  Parameters<ReturnType<typeof useKitchenInterface>['pill']>[0],
  null | undefined
>

const { focus, group } = useKitchenConsoleOverview()
const { pill } = useKitchenInterface()

const toDemoKitchenSurface = (kitchen: DemoKitchenListItem): KitchenPillInput => ({
  id: kitchen.id,
  place_id: kitchen.id,
  is_test_kitchen: false,
  name: kitchen.name,
  short_address: kitchen.label,
  image_url: kitchen.image_url,
})

const focusCard = computed<KitchenPillCard | null>(() => {
  const kitchen = focus.value.entity as KitchenPillInput | DemoKitchenListItem | null
  if (!kitchen) return null

  if (focus.value.mode === 'demo') {
    return pill(toDemoKitchenSurface(kitchen as DemoKitchenListItem)) ?? null
  }

  return pill(kitchen) ?? null
})

const groupCards = computed<KitchenPillCard[]>(() =>
  group.value.items
    .map((kitchen) => pill(kitchen))
    .filter((card): card is KitchenPillCard => Boolean(card))
)

const groupCountLabel = computed(() => String(group.value.count))
const focusModeLabel = computed(() =>
  focus.value.mode === 'demo' ? 'Demo' : focus.value.mode === 'test' ? 'Test' : 'Live'
)
</script>
