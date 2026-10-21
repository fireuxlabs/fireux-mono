<template>
  <UCard>
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
        :disabled="!canEdit"
        @click="emit('edit')"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenPromotion } from '../../../../models/promotion.model'
import { useKitchenPromotionsContext } from '../../../../composables/promotions/useKitchenPromotionsContext'
defineProps<{ promotion: KitchenPromotion }>()
const emit = defineEmits<{ edit: [] }>()
const { state } = useKitchenPromotionsContext()
const canEdit = computed(
  () =>
    state.canWrite.value &&
    ['ready', 'empty'].includes(state.dishes.outcome.value)
)
const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat('en-CH', { style: 'currency', currency }).format(price)
const dishName = (id: string) =>
  state.dishes.items.value.find((dish) => dish.id === id)?.name ||
  'Unavailable dish'
</script>
