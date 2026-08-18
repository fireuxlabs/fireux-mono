<template>
  <div class="basic-fields">
    <UInput v-model="product.name" placeholder="Product Name" />
    <p v-if="isSlugTaken" class="slug-warning">
      ⚠️ That name is already used for another product in this workspace. Please
      choose a more unique name.
    </p>
    <UInput v-model="product.tagline" placeholder="Tagline (short)" />
    <UTextarea
      v-model="product.description"
      autoresize
      placeholder="Description"
      class="unstyled-textarea"
    />
    <MoleculesFormsStateRichText v-model="product.content" />
  </div>
</template>

<script setup lang="ts">
import { useCreateProductState } from '../../composables/create/useCreateProductState';

// Shared creation state
const { product, isSlugTaken } = await useCreateProductState()
</script>

<style scoped>
.basic-fields {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}
.slug-warning {
  color: var(--ui-warning);
  font-size: var(--text-sm);
  margin-top: calc(var(--spacing) * -4);
  margin-bottom: calc(var(--spacing) * 2);
}
</style>
