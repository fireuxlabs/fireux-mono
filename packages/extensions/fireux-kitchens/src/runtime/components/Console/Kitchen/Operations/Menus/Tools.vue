<template>
  <section
    aria-labelledby="create-menu-title"
  >
    <NuxtLink
      to="/console/kitchen/menus/create"
      class="create-menu-panel group flex flex-col overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div class="flex min-h-0 flex-1 items-center justify-center">
        <span class="flex size-12 items-center justify-center rounded-full bg-primary text-inverted shadow-sm transition-transform group-hover:scale-105">
          <UIcon name="i-lucide-plus" class="size-6" />
        </span>
      </div>

      <div class="flex items-center gap-2 border-t border-primary/15 bg-default/70 px-3 py-3">
        <h2 id="create-menu-title" class="text-sm font-semibold text-highlighted">
          Create menu
        </h2>
        <UIcon
          name="i-lucide-arrow-right"
          class="ml-auto size-4 text-muted transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </NuxtLink>
  </section>
</template>

<style scoped>
.create-menu-panel {
  aspect-ratio: 1;
  width: calc(var(--spacing) * 38);
}
</style>
