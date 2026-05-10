<template>
  <UCard v-if="dish">
    <div class="space-y-5">
      <div class="flex items-start gap-3">
        <UAvatar
          icon="i-lucide-utensils"
          size="lg"
          class="shrink-0"
        />

        <div class="min-w-0 space-y-2">
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ dish.name }}
          </h2>
          <p
            v-if="dish.description"
            class="max-w-2xl text-sm text-dimmed"
          >
            {{ dish.description }}
          </p>
        </div>
      </div>

      <div class="console-summary-grid">
        <div class="console-summary-field">
          Mise:
          <span class="console-summary-value">{{ miseCount }}</span>
        </div>
        <div class="console-summary-field">
          Ingredients:
          <span class="console-summary-value">{{ ingredientCount }}</span>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <UCard variant="soft">
          <div class="space-y-3">
            <div class="text-sm font-medium text-highlighted">Mise</div>
            <div
              v-if="miseIds.length"
              class="flex flex-wrap gap-1.5"
            >
              <UButton
                v-for="miseId in miseIds"
                :key="miseId"
                :to="`/console/kitchen/mise/${encodeURIComponent(miseId)}`"
                size="xs"
                color="neutral"
                variant="soft"
                icon="i-lucide-list-checks"
              >
                {{ miseId }}
              </UButton>
            </div>
            <p
              v-else
              class="text-xs text-dimmed"
            >
              No mise links yet.
            </p>
          </div>
        </UCard>

        <UCard variant="soft">
          <div class="space-y-3">
            <div class="text-sm font-medium text-highlighted">Ingredients</div>
            <div
              v-if="ingredientIds.length"
              class="flex flex-wrap gap-1.5"
            >
              <UButton
                v-for="ingredientId in ingredientIds"
                :key="ingredientId"
                :to="`/ingredients/${encodeURIComponent(ingredientId)}`"
                size="xs"
                color="neutral"
                variant="soft"
                icon="i-lucide-carrot"
              >
                {{ ingredientId }}
              </UButton>
            </div>
            <p
              v-else
              class="text-xs text-dimmed"
            >
              No ingredient links yet.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'

const props = defineProps<{
  dish: Dish | null
}>()

const miseIds = computed(() =>
  Array.isArray(props.dish?.mise_ids) ? props.dish.mise_ids : []
)

const ingredientIds = computed(() =>
  Array.isArray(props.dish?.ingredient_ids) ? props.dish.ingredient_ids : []
)

const miseCount = computed(() => miseIds.value.length)
const ingredientCount = computed(() => ingredientIds.value.length)
</script>
