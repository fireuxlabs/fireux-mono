<template>
  <UCard class="overflow-hidden">
    <div class="space-y-3">
      <div class="mx-auto h-[200px] w-[200px] overflow-hidden rounded-md border border-default bg-elevated/40">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          alt="Dish image"
          class="h-[200px] w-[200px] object-cover"
          loading="lazy"
        >
        <div v-else class="flex h-[200px] w-[200px] items-center justify-center text-dimmed">
          <UIcon name="i-lucide-utensils" class="size-6" />
        </div>
      </div>

      <div class="space-y-2">
        <div v-if="ingredientPills.length" class="flex flex-wrap items-center gap-1">
          <IngredientCardsPill
            v-for="pill in ingredientPills"
            :key="pill.id"
            :to="pill.to"
            :title="pill.title"
            :image-url="pill.imageUrl"
            :link="false"
          >
          </IngredientCardsPill>
        </div>
      </div>

      <div class="space-y-2">
        <div v-if="misePills.length" class="flex flex-wrap items-center gap-1">
          <MiseCardsPill
            v-for="pill in misePills"
            :key="pill.id"
            :to="pill.to"
            :title="pill.title"
            :image-url="pill.imageUrl"
            :link="false"
          >
          </MiseCardsPill>
        </div>
      </div>

      <div v-if="$slots.actions" class="pt-1">
        <slot name="actions" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type Props = {
  imageUrl: string
  ingredientPills?: Array<{ id: string; to: string; title: string; imageUrl: string }>
  misePills?: Array<{ id: string; to: string; title: string; imageUrl: string }>
}

const props = withDefaults(defineProps<Props>(), {
  ingredientPills: () => [],
  misePills: () => [],
})
</script>
