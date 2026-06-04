<template>
  <UCard class="kitchen-extension-card">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <UAvatar
        :src="card.imageUrl || undefined"
        :alt="card.title"
        icon="i-lucide-chef-hat"
        size="xl"
        class="bg-primary/10 text-primary"
      />

      <div class="min-w-0 flex-1 space-y-3">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="primary" variant="soft">
              Misebox extension
            </UBadge>
            <span class="text-xs uppercase tracking-[0.16em] text-muted">
              Kitchen operation
            </span>
          </div>

          <h2 class="text-2xl font-semibold text-highlighted">
            {{ kitchenTitle }}
          </h2>
          <p class="max-w-3xl text-sm text-toned">
            Menus, recipes, ingredients, and kitchen work for this place.
          </p>
          <p v-if="card.prop" class="max-w-3xl text-sm text-muted">
            {{ card.prop }}
          </p>
        </div>

        <div
          v-if="card.verified || card.badges.length"
          class="flex flex-wrap gap-2"
        >
          <UBadge v-if="card.verified" color="primary" variant="soft">
            Verified
          </UBadge>
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            color="neutral"
            variant="soft"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenCard } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{ card: KitchenCard.Profile }>()

const kitchenTitle = computed(() =>
  props.card.title ? `${props.card.title} kitchen` : 'Kitchen operation'
)

</script>

<style scoped>
.kitchen-extension-card {
  border-color: color-mix(in srgb, var(--ui-primary) 28%, transparent);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--ui-primary) 8%, transparent),
      transparent 42%
    ),
    var(--ui-bg);
  box-shadow: inset 4px 0 0 color-mix(in srgb, var(--ui-primary) 55%, transparent);
}
</style>
