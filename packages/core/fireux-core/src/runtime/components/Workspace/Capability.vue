<template>
  <section class="grid gap-5">
    <div
      v-if="$slots['workspace-tools']"
      class="flex flex-wrap items-center gap-2"
    >
      <slot name="workspace-tools" />
    </div>
    <div class="grid items-start gap-5 md:grid-cols-2">
      <section class="min-w-0 grid gap-4">
        <slot name="collection-panel">
          <header class="flex flex-wrap items-center justify-between gap-2">
            <slot name="collection-heading"
              ><h2 class="font-semibold">{{ collectionLabel }}</h2></slot
            >
            <div class="flex flex-wrap gap-2">
              <slot name="collection-tools" />
            </div>
          </header>
          <slot name="collection" />
          <slot name="collection-open-tools" />
        </slot>
      </section>
      <section class="min-w-0 grid gap-4">
        <slot name="selected-panel">
          <header class="flex flex-wrap items-center justify-between gap-2">
            <slot name="selected-heading"
              ><h2 class="font-semibold">In focus</h2></slot
            >
            <div class="flex flex-wrap gap-2">
              <slot name="selected-tools" />
            </div>
          </header>
          <slot name="selected" />
          <slot name="selected-open-tools" />
        </slot>
      </section>
    </div>
    <slot name="workspace-open-tools" />
  </section>
</template>
<script setup lang="ts">
defineProps<{ collectionLabel: string }>()
</script>
