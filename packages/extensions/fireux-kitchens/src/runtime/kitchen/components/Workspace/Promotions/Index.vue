<template>
  <section class="mx-auto w-full max-w-4xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UPageHeader
        title="Promotions"
        description="Dish offers and meal deals using your food and drinks."
      />
      <UButton
        v-if="
          state.canWrite.value &&
          !editing &&
          ['ready', 'empty'].includes(state.dishes.outcome.value)
        "
        label="Add promotion"
        icon="i-lucide-plus"
        @click="editing = 'new'"
      />
    </div>
    <p v-if="state.identity.outcome.value === 'pending'" role="status">
      Loading Kitchen…
    </p>
    <div v-else-if="state.identity.outcome.value === 'error'" role="alert">
      Kitchen could not be loaded.
    </div>
    <p v-else-if="!state.kitchenId.value">
      Choose a Kitchen to view its promotions.
    </p>
    <template v-else>
      <div v-if="state.dishes.error.value" role="alert">
        <p>Food and drinks could not be loaded.</p>
        <MoleculesCopyError :message="String(state.dishes.error.value)" />
      </div>
      <p v-else-if="state.dishes.pending.value" role="status">
        Loading food and drinks…
      </p>
      <div v-if="state.collection.outcome.value === 'error'" role="alert">
        <p>Promotions could not be loaded.</p>
        <MoleculesCopyError :message="String(state.collection.error.value)" />
      </div>
      <p v-else-if="state.collection.pending.value" role="status">
        Loading promotions…
      </p>
      <template v-else>
        <WorkspaceKitchenPromotionsEditor
          v-if="editing"
          :key="editing"
          :state="state"
          :promotion="selectedPromotion"
          @close="editing = ''"
        />
        <div v-else-if="state.collection.items.value.length" class="grid gap-4">
          <UCard
            v-for="promotion in state.collection.items.value"
            :key="promotion.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-2">
                <h2 class="text-lg font-semibold">{{ promotion.name }}</h2>
                <template v-if="'groups' in promotion">
                  <p>
                    Meal deal ·
                    {{ formatPrice(promotion.price, promotion.currency) }}
                  </p>
                  <ul class="space-y-2 text-sm">
                    <li v-for="group in promotion.groups" :key="group.id">
                      <p class="font-medium">
                        {{ group.name }} · Choose {{ group.choose }}
                      </p>
                      <p class="text-muted">
                        {{
                          group.dishes
                            .map(
                              (dish) =>
                                `${dishName(dish.dishId)} (${dish.supplement ? '+' + formatPrice(dish.supplement, promotion.currency) : 'included'})`
                            )
                            .join(', ')
                        }}
                      </p>
                    </li>
                  </ul>
                </template>
                <p v-else>Dish offer · {{ promotion.dishes.length }} dishes</p>
                <p class="text-sm text-muted">
                  {{
                    promotion.days
                      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                      .join(', ')
                  }}
                </p>
                <UBadge
                  :label="promotion.status === 'active' ? 'Active' : 'Paused'"
                  :color="promotion.status === 'active' ? 'success' : 'neutral'"
                  variant="soft"
                />
              </div>
              <UButton
                label="Edit"
                color="neutral"
                variant="soft"
                :disabled="!state.canWrite.value"
                @click="editing = promotion.id"
              />
            </div>
          </UCard>
        </div>
        <p
          v-else-if="!editing"
          class="rounded-xl border border-default p-5 text-muted"
        >
          No promotions yet.
        </p>
      </template>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenPromotions } from '../../../composables/promotions/useKitchenPromotions'
const state = useKitchenPromotions()
const editing = ref('')
const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat('en-CH', { style: 'currency', currency }).format(price)
const dishName = (id: string) =>
  state.dishes.items.value.find((dish) => dish.id === id)?.name ||
  'Unavailable dish'
const selectedPromotion = computed(() =>
  state.collection.items.value.find((row) => row.id === editing.value)
)
watch(state.scopeKey, () => {
  editing.value = ''
})
</script>
