<template>
  <MoleculesActionSurface
    :to="to"
    :data-ingredient-id="id"
    class="card card--cell ingredient-card group flex min-w-0 flex-col"
  >
    <div class="aspect-square overflow-hidden bg-elevated">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="title"
        class="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      />
      <div
        v-else
        class="flex size-full items-center justify-center text-muted"
        aria-hidden="true"
      >
        <UIcon :name="icon" class="size-7" />
      </div>
    </div>

    <div
      class="flex min-w-0 items-center gap-2 border-t border-default px-3 py-2.5"
    >
      <h3
        class="min-w-0 flex-1 truncate text-sm font-semibold text-highlighted"
      >
        {{ title || 'Unnamed ingredient' }}
      </h3>
      <UIcon
        name="i-lucide-arrow-right"
        class="size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </div>
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    to: string
    title: string
    imageUrl?: string
    icon?: string
  }>(),
  {
    imageUrl: '',
    icon: 'i-lucide-carrot',
  }
)
</script>

<style scoped>
.ingredient-card {
  display: flex;
  flex-direction: column;
  width: calc(var(--spacing) * 36);
  padding: 0;
}
</style>
