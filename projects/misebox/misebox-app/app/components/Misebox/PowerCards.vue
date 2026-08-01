<template>
  <section class="misebox-power-cards" aria-label="PowerCards">
    <MiseboxElementWindow v-if="orbit">
      <template #kitchens>
        <MiseboxPowerCardOne :kitchens="orbit.cards.kitchens" />
      </template>
      <template #menu>
        <MiseboxPowerCardThree :menu="orbit.cards.menu" />
      </template>
      <template #dish>
        <MiseboxPowerCardFour :dish="orbit.cards.dish" />
      </template>
      <template #mise>
        <MiseboxPowerCardFive :mise="orbit.cards.mise" />
      </template>
      <template #recipe>
        <MiseboxPowerCardSix :recipe="orbit.cards.recipe" />
      </template>
      <template #supplier-item>
        <MiseboxPowerCardSeven :supplier-item="orbit.cards.supplierItem" />
      </template>
      <template #order-item>
        <MiseboxPowerCardEight
          :item="orbit.cards.orderItem.item"
          :currency-code="orbit.cards.orderItem.currencyCode"
        />
      </template>
      <template #supplier>
        <MiseboxPowerCardTen :supplier="orbit.cards.supplier" />
      </template>
    </MiseboxElementWindow>

    <div
      v-else-if="pending"
      class="misebox-power-cards__state"
      aria-label="Loading PowerCards"
    >
      <USkeleton class="misebox-power-cards__skeleton" />
    </div>

    <div v-else-if="error" class="misebox-power-cards__state">
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="Demo cards could not be loaded"
        description="The local Misebox product demonstration is temporarily unavailable."
        :actions="[
          {
            label: 'Try again',
            color: 'error',
            variant: 'soft',
            onClick: refreshPowerCards,
          },
        ]"
      />
    </div>

    <div v-else class="misebox-power-cards__state">
      <MoleculesStateCard
        entity="PowerCards"
        state="empty"
        surface="bare"
        title="No Demo cards available"
        description="The Misebox Demo cards could not be composed."
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useMiseboxPowerCardsProductDemo } from '../../composables/product-demo/useMiseboxPowerCardsProductDemo'
import MiseboxPowerCardOne from './PowerCardOne.vue'
import MiseboxElementWindow from './ElementWindow.vue'
import MiseboxPowerCardThree from './PowerCardThree.vue'
import MiseboxPowerCardFour from './PowerCardFour.vue'
import MiseboxPowerCardFive from './PowerCardFive.vue'
import MiseboxPowerCardSix from './PowerCardSix.vue'
import MiseboxPowerCardSeven from './PowerCardSeven.vue'
import MiseboxPowerCardEight from './PowerCardEight.vue'
import MiseboxPowerCardTen from './PowerCardTen.vue'

const {
  data: orbit,
  pending,
  error,
  refresh,
} = await useMiseboxPowerCardsProductDemo()

async function refreshPowerCards(): Promise<void> {
  await refresh()
}
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.misebox-power-cards {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: calc(var(--spacing) * 5);
}

.misebox-power-cards__state {
  display: grid;
  min-height: 42rem;
  place-items: center;
}

.misebox-power-cards__skeleton {
  width: min(24rem, 72vw);
  height: calc(var(--spacing) * 24);
  border-radius: calc(var(--ui-radius) * 4);
}

@media (min-width: 48rem) {
  .misebox-power-cards__state {
    min-height: 48rem;
  }
}
</style>
