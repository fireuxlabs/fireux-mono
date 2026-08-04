<!-- Blog Image Upload Component -->
<template>
  <div class="images-system">
    <div class="image-card featured">
      <div class="card-header">
        <div class="card-title">Wordmark</div>
        <div class="card-hint">Wide feature image</div>
      </div>
      <MoleculesFormsStateImagePicker
        ref="featuredImageRef"
        label="Wordmark"
        :state-key="FEATURED_IMAGE_KEY"
      />
    </div>

    <div class="image-card social">
      <div class="card-header">
        <div class="card-title">Logo</div>
        <div class="card-hint">Square social image</div>
      </div>
      <MoleculesFormsStateImagePicker
        ref="socialImageRef"
        label="Logo"
        :state-key="SOCIAL_IMAGE_KEY"
      />
    </div>

    <!-- Upload Progress Display -->
    <div v-if="showProgress" class="upload-progress">
      <h4>Uploading Images...</h4>
      <div class="uploading-spinner">
        <UIcon name="i-lucide-loader-2" class="animate-spin" />
        <span>Processing images...</span>
      </div>

      <!-- Error Display -->
      <div v-if="Object.keys(uploadErrors).length" class="upload-errors">
        <div v-for="(error, key) in uploadErrors" :key="key" class="error-item">
          <UIcon name="i-lucide-alert-circle" />
          <span>{{ key }}: {{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'

// Base keys for image slots
const FEATURED_IMAGE_KEY = 'createBlogFeaturedImage'
const SOCIAL_IMAGE_KEY = 'createBlogSocialImage'

// Component refs
const featuredImageRef = ref()
const socialImageRef = ref()

// Upload state
const uploading = ref(false)
const uploadErrors = ref<Record<string, string>>({})

// Show progress when uploading
const showProgress = computed(() => uploading.value)

// Get upload service
const { uploadImage } = useImageStorage()

// Expose methods for parent component
defineExpose({
  async uploadImages(blogId: string) {
    try {
      uploading.value = true
      uploadErrors.value = {}

      const results: { featuredImage: string; socialImage: string } = {
        featuredImage: '',
        socialImage: '',
      }

      // Upload featured image if available
      const featuredFile = featuredImageRef.value?.getFile()
      if (featuredFile) {
        try {
          results.featuredImage = await uploadImage(
            featuredFile,
            `blogs/${blogId}/featured.jpg`
          )
        } catch (error) {
          uploadErrors.value.featured =
            error instanceof Error ? error.message : 'Upload failed'
        }
      }

      // Upload social image if available
      const socialFile = socialImageRef.value?.getFile()
      if (socialFile) {
        try {
          results.socialImage = await uploadImage(
            socialFile,
            `blogs/${blogId}/social.jpg`
          )
        } catch (error) {
          uploadErrors.value.social =
            error instanceof Error ? error.message : 'Upload failed'
        }
      }

      return results
    } finally {
      uploading.value = false
    }
  },

  getImageFiles() {
    return {
      featured: featuredImageRef.value?.getFile(),
      social: socialImageRef.value?.getFile(),
    }
  },

  clearImages() {
    featuredImageRef.value?.clear()
    socialImageRef.value?.clear()
    uploadErrors.value = {}
  },
})
</script>

<style scoped>
.images-system {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
}

@media (min-width: 640px) {
  .images-system {
    flex-direction: row;
  }
}

.image-card {
  position: relative;
  width: 100%;
  background: var(--ui-bg-elevated);
  border-radius: calc(var(--ui-radius) * 1.5);
  border: 1px solid var(--ui-border);
  padding: calc(var(--spacing) * 4);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 3);
  flex: 1;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 0.5);
}

.card-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wide);
}

.card-hint {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.image-card :deep(.picker-label) {
  display: none;
}

.image-card :deep(.image-container) {
  width: 100%;
  border-radius: var(--ui-radius);
}

.image-card.featured :deep(.image-container) {
  aspect-ratio: 2 / 1;
  max-width: 640px;
}

.image-card.social :deep(.image-container) {
  aspect-ratio: 1 / 1;
  max-width: 360px;
}

.image-card :deep(.image-container img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}

.image-card :deep(.actions) {
  margin-top: calc(var(--spacing) * 2);
}

.image-card :deep(.file-info) {
  margin-top: var(--spacing);
}

.image-card :deep(.upload-controls) {
  justify-content: flex-start;
}

/* Upload Progress Styles */
.upload-progress {
  margin-top: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4);
  background: var(--ui-bg-elevated);
  border-radius: calc(var(--ui-radius) * 1.5);
  border: 1px solid var(--ui-border);
}

.upload-progress h4 {
  margin: 0 0 calc(var(--spacing) * 3) 0;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--ui-text-highlighted);
}

.uploading-spinner {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 3);
}

.upload-errors {
  margin-top: calc(var(--spacing) * 3);
  padding-top: calc(var(--spacing) * 3);
  border-top: 1px solid var(--ui-border);
}

.error-item {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 2);
  background: color-mix(in srgb, var(--ui-error) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-error) 25%, transparent);
  border-radius: var(--ui-radius);
  color: var(--ui-error);
  font-size: var(--text-sm);
  margin-bottom: calc(var(--spacing) * 2);
}

</style>
