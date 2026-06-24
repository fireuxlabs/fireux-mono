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
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage.ts'

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
  gap: 1rem;
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
  border-radius: var(--radius-md);
  border: 1px solid var(--ui-border);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.card-hint {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.image-card :deep(.picker-label) {
  display: none;
}

.image-card :deep(.image-container) {
  width: 100%;
  border-radius: var(--radius-sm);
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
  margin-top: var(--space-2);
}

.image-card :deep(.file-info) {
  margin-top: var(--space-1);
}

.image-card :deep(.upload-controls) {
  justify-content: flex-start;
}

/* Upload Progress Styles */
.upload-progress {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: var(--ui-bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--ui-border);
}

.upload-progress h4 {
  margin: 0 0 var(--space-3) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.uploading-spinner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.upload-errors {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--ui-border);
}

.error-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--radius-sm);
  color: var(--color-red-700);
  font-size: 0.875rem;
  margin-bottom: var(--space-2);
}

/* Color mode spine: docs/concepts/color-mode.md */
:global(:root.dark) .error-item {
  background: var(--color-red-950);
  border-color: var(--color-red-800);
  color: var(--color-red-300);
}
</style>
