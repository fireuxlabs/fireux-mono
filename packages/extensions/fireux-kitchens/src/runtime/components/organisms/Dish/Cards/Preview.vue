<template>
  <UCard>
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <UAvatar
          icon="i-lucide-utensils"
          size="sm"
        />
        <div class="text-sm font-medium text-highlighted">Dish semantics</div>
      </div>

      <div
        v-if="recipeIds.length || ingredientIds.length"
        class="space-y-2"
      >
        <div
          v-if="recipeIds.length"
          class="flex flex-wrap gap-1"
        >
          <UBadge
            v-for="recipeId in recipeIds"
            :key="recipeId"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ recipeId }}
          </UBadge>
        </div>

        <div
          v-if="ingredientIds.length"
          class="flex flex-wrap gap-1"
        >
          <UBadge
            v-for="ingredientId in ingredientIds"
            :key="ingredientId"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ ingredientId }}
          </UBadge>
        </div>
      </div>

      <p
        v-else
        class="text-sm text-dimmed"
      >
        No semantic links yet.
      </p>

      <div
        v-if="$slots.actions"
        class="pt-1"
      >
        <slot name="actions" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type Props = {
  recipeIds?: string[]
  ingredientIds?: string[]
}

withDefaults(defineProps<Props>(), {
  recipeIds: () => [],
  ingredientIds: () => [],
})
</script>
