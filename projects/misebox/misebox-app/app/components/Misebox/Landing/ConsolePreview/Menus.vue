<template>
  <div class="mt-5" aria-label="Menus preview">
    <div v-if="menus.length" class="console-preview-menus">
      <article
        v-for="menu in menus"
        :key="menu.id"
        class="console-preview-menu-card flex min-w-0 flex-col overflow-hidden rounded-xl border border-default bg-default shadow-sm"
      >
        <img
          v-if="menu.imageUrl"
          :src="menu.imageUrl"
          :alt="menu.imageAlt"
          class="aspect-square w-full object-cover"
          loading="lazy"
        >
        <div
          v-else
          class="flex aspect-square w-full items-center justify-center bg-elevated text-muted"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-image" class="size-6" />
        </div>

        <div class="flex min-w-0 items-center gap-2 border-t border-default px-3 py-2.5">
          <p class="truncate text-xs font-semibold text-highlighted">
            {{ menu.name }}
          </p>
          <UIcon
            name="i-lucide-arrow-right"
            class="ml-auto size-3.5 shrink-0 text-muted"
          />
        </div>
      </article>

      <article
        class="console-preview-menu-card console-preview-create-card flex min-w-0 flex-col overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm"
      >
        <div class="flex min-h-0 flex-1 items-center justify-center">
          <span class="flex size-10 items-center justify-center rounded-full bg-primary text-inverted shadow-sm">
            <UIcon name="i-lucide-plus" class="size-5" />
          </span>
        </div>
        <div class="flex items-center gap-2 border-t border-primary/15 bg-default/70 px-3 py-2.5">
          <p class="text-xs font-semibold text-highlighted">Create menu</p>
          <UIcon name="i-lucide-arrow-right" class="ml-auto size-3.5 shrink-0 text-muted" />
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

type ProductDemoMenu = MiseboxProductDemo['console']['menus'][number]

defineProps<{
  menus: ProductDemoMenu[]
  error: boolean
}>()
</script>

<style scoped>
.console-preview-menus {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 2);
}

.console-preview-menu-card {
  width: 100%;
}

.console-preview-create-card {
  aspect-ratio: 1;
}

@media (min-width: 640px) {
  .console-preview-menus {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--spacing) * 3);
  }

  .console-preview-menu-card {
    flex: 0 0 calc(var(--spacing) * 30);
  }
}
</style>
