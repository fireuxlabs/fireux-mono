<!-- app/components/organisms/Blog/Create/Images.vue -->
<template>
  <div class="images-system">
    <div class="image-wrapper featured">
      <MoleculesFormsStateImagePicker
        label="Featured Image"
        :state-key="FEATURED_IMAGE_KEY"
      />
    </div>

    <div class="image-wrapper social">
      <MoleculesFormsStateImagePicker
        label="Social Image"
        :state-key="SOCIAL_IMAGE_KEY"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// base keys for your two image slots (picker will append “Data” internally)
const FEATURED_IMAGE_KEY = 'createBlogFeaturedImage'
const SOCIAL_IMAGE_KEY = 'createBlogSocialImage'
</script>

<style scoped>
.images-system {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .images-system {
    flex-direction: row;
  }
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

/* Featured = 2:1 ratio */
.image-wrapper.featured {
  aspect-ratio: 2 / 1;
  max-width: 600px;
}

/* Social = ~1.9:1 ratio (1200×630) */
.image-wrapper.social {
  aspect-ratio: 1200 / 630;
  max-width: 600px;
}

/*
  Any <img> inside .image-wrapper will:
  • fill the container
  • crop via object-fit
  • stay centered
*/
.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}
</style>
