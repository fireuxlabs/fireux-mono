<template>
  <div class="basic-fields">
    <UInput v-model="product.name" placeholder="Product Name" />
    <p v-if="isSlugTaken" class="slug-warning">
      ⚠️ That name is already used for another product in this workspace. Please
      choose a more unique name.
    </p>
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
// Shared creation state
const { product, isSlugTaken } = useCreateProductState()
</script>

<style scoped>
.basic-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.slug-warning {
  color: var(--warning);
  font-size: 0.875rem;
  margin-top: -1rem;
  margin-bottom: 0.5rem;
}
</style>
