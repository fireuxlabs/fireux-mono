<!-- COMMENT: app/pages/design/atoms/img.vue -->
<script setup>
const { data: images } = await useFetch('/api/images');
</script>

<template>
  <div class="test-container">
    <h1>📸 Image List</h1>

    <div v-if="images" class="image-list">
      <div v-for="src in images" :key="src" class="image-item">
        <img :src="src" :alt="src" class="test-image" >
        <span class="image-name">{{ src }}</span>
      </div>
    </div>

    <p v-else>Loading images...</p>
  </div>
</template>

<style scoped>
.test-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
.image-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.test-image {
  width: 100px;
  height: auto;
  border-radius: 4px;
}
.image-name {
  font-size: 0.9rem;
  color: gray;
}
</style>