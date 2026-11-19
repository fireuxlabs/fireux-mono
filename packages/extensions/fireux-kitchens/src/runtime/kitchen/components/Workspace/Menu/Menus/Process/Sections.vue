<template>
  <div class="workspace-surface workspace-surface--compact">
    <p v-if="!sections.length" class="fx-type-caption">
      {{ emptyLabel }}
    </p>

    <section
      v-for="section in sections"
      v-else
      :key="section.label"
      class="workspace-surface workspace-surface--compact"
    >
      <h4 class="fx-type-caption">
        {{ section.label || 'Untitled section' }}
      </h4>

      <div class="workspace-surface workspace-surface--compact">
        <article
          v-for="item in section.items"
          :key="`${section.label}-${item.name}`"
          class="menu-process-item"
        >
          <div class="menu-process-row">
            <div class="workspace-surface workspace-surface--compact">
              <p class="fx-type-card-heading">
                {{ item.name || 'Untitled item' }}
              </p>
              <p v-if="item.description" class="fx-type-caption">
                {{ item.description }}
              </p>
              <div
                v-if="item.priceOptions.length || item.addOns.length"
                class="workspace-surface workspace-surface--compact"
              >
                <UBadge
                  v-for="option in item.priceOptions"
                  :key="`${item.name}-${option.label}-${option.price}`"
                  color="neutral"
                  variant="soft"
                  size="xs"
                >
                  {{ option.label }} · {{ option.price }}
                </UBadge>
                <UBadge
                  v-for="addOn in item.addOns"
                  :key="`${item.name}-add-on-${addOn.label}-${addOn.price}`"
                  color="primary"
                  variant="soft"
                  size="xs"
                >
                  + {{ addOn.label }} · {{ addOn.price }}
                </UBadge>
              </div>
            </div>
            <p v-if="item.price" class="menu-process-price">
              {{ item.price }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sections: {
    label: string
    items: {
      name: string
      description: string
      price: string
      addOns: {
        label: string
        price: string
      }[]
      priceOptions: {
        label: string
        price: string
      }[]
    }[]
  }[]
  emptyLabel: string
}>()
</script>

<style scoped>
.menu-process-item {
  padding-block: calc(var(--spacing) * 3);
  border-bottom: 1px solid var(--ui-border);
}
.menu-process-row {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: calc(var(--spacing) * 3);
}
.menu-process-price {
  flex-shrink: 0;
  font-weight: var(--font-weight-semibold);
}
</style>
