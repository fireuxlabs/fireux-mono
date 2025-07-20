<!-- Blog Image Upload Component -->
<template>
  <div class="images-system">
    <div class="image-wrapper featured">
      <FireMoleculesFormsStateImagePicker
        ref="featuredImageRef"
        label="Featured Image"
        :state-key="FEATURED_IMAGE_KEY"
      />
    </div>

    <div class="image-wrapper social">
      <FireMoleculesFormsStateImagePicker
        ref="socialImageRef"
        label="Social Image"
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
import { useMediaStorage } from '../../../../composables/firebase/useMediaStorage'

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
const { uploadImage } = useMediaStorage()

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
            'blogs',
            blogId,
            'featured'
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
            'blogs',
            blogId,
            'social'
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

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
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

@media (prefers-color-scheme: dark) {
  .error-item {
    background: var(--color-red-950);
    border-color: var(--color-red-800);
    color: var(--color-red-300);
  }
}
</style>
