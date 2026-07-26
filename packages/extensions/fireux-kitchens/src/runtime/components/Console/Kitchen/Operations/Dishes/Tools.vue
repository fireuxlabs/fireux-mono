<template>
  <section aria-labelledby="create-dish-title">
    <NuxtLink
      to="/console/kitchen/dishes/create"
      class="create-dish-panel group flex flex-col overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div class="flex min-h-0 flex-1 items-center justify-center">
        <span class="flex size-10 items-center justify-center rounded-full bg-primary text-inverted shadow-sm transition-transform group-hover:scale-105">
          <UIcon name="i-lucide-plus" class="size-5" />
        </span>
      </div>

      <div class="flex items-center gap-2 border-t border-primary/15 bg-default/70 px-3 py-2.5">
        <h2 id="create-dish-title" class="truncate text-sm font-semibold text-highlighted">
          Create dish
        </h2>
        <UIcon
          name="i-lucide-arrow-right"
          class="ml-auto size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </NuxtLink>
  </section>
</template>

<style scoped>
.create-dish-panel {
  aspect-ratio: 4 / 5;
  width: calc(var(--spacing) * 32);
}
</style>
