<!-- app/components/organisms/Product/Create/Images.vue -->
<template>
  <div class="images-system">
    <!-- Main Product Image -->
    <div class="image-wrapper main">
      <FireMoleculesFormsStateImagePicker
        label="Main Product Image"
        state-key="createProductMainImage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional keys needed since we only have one slot now
</script>

<style scoped>
.images-system {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--ui-bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--ui-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Main = square */
.image-wrapper.main {
  aspect-ratio: 1 / 1;
  max-width: 400px;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}
</style>
