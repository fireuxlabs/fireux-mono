<template>
  <div aria-label="Menus preview">
    <div v-if="menus.length" class="workspace-preview-menus">
      <article
        v-for="menu in menus"
        :key="menu.id"
        class="workspace-preview-menu-card"
      >
        <img
          v-if="menu.imageUrl"
          :src="menu.imageUrl"
          :alt="menu.imageAlt"
          loading="lazy"
        />
        <div v-else aria-hidden="true">
          <UIcon name="i-lucide-image" />
        </div>

        <div>
          <p class="fx-type-caption">
            {{ menu.name }}
          </p>
          <UIcon name="i-lucide-arrow-right" />
        </div>
      </article>

      <article
        class="workspace-preview-menu-card workspace-preview-create-card"
      >
        <div>
          <span>
            <UIcon name="i-lucide-plus" />
          </span>
        </div>
        <div>
          <p class="fx-type-caption">Create menu</p>
          <UIcon name="i-lucide-arrow-right" />
        </div>
      </article>
    </div>

    <UAlert
      v-else-if="error"
      color="neutral"
      variant="soft"
      title="Menu preview unavailable"
      description="No Demo Kitchen data was loaded."
    />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoMenu = MiseboxProductDemo['workspace']['menus'][number]

defineProps<{
  menus: ProductDemoMenu[]
  error: boolean
}>()
</script>

<style scoped>
.workspace-preview-menus {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 2);
}

.workspace-preview-menu-card {
  width: 100%;
}

.workspace-preview-create-card {
  aspect-ratio: 1;
}

@media (min-width: 640px) {
  .workspace-preview-menus {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--spacing) * 3);
  }

  .workspace-preview-menu-card {
    flex: 0 0 calc(var(--spacing) * 30);
  }
}
</style>
