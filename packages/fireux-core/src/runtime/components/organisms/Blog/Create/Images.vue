<!-- app/components/organisms/Blog/Create<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageUploadBridge } from '../../../composables/utils/useImageUploadBridge'

// base keys for your two image slots (picker will append "Data" internally)
const FEATURED_IMAGE_KEY = 'createBlogFeaturedImage'
const SOCIAL_IMAGE_KEY = 'createBlogSocialImage'

// Component refs
const featuredImageRef = ref()
const socialImageRef = ref()

// Upload bridge
const { uploadProgress, uploadErrors, uploadStateImages, clearUploadState } = useImageUploadBridge()

// Show progress when uploading
const showProgress = computed(() => {
  return Object.keys(uploadProgress.value).length > 0
})

// Expose methods for parent component
defineExpose({
  async uploadImages(blogId: string) {
    try {
      clearUploadState()
      
      const imageRefs = {
        featured: featuredImageRef.value,
        social: socialImageRef.value
      }
      
      const urls = await uploadStateImages(imageRefs, 'blogs', blogId)
      
      return {
        featuredImage: urls.featured || '',
        socialImage: urls.social || ''
      }
    } catch (error) {
      console.error('Error uploading blog images:', error)
      throw error
    }
  },
  
  getImageFiles() {
    return {
      featured: featuredImageRef.value?.getFile(),
      social: socialImageRef.value?.getFile()
    }
  },
  
  clearImages() {
    featuredImageRef.value?.clear()
    socialImageRef.value?.clear()
    clearUploadState()
  }
})
</script>es.vue -->
<template>
  <div class="images-system">
    <div class="image-wrapper featured">
      <MoleculesFormsStateImagePicker
        ref="featuredImageRef"
        label="Featured Image"
        :state-key="FEATURED_IMAGE_KEY"
      />
    </div>

    <div class="image-wrapper social">
      <MoleculesFormsStateImagePicker
        ref="socialImageRef"
        label="Social Image"
        :state-key="SOCIAL_IMAGE_KEY"
      />
    </div>

    <!-- Upload Progress Display -->
    <div v-if="showProgress" class="upload-progress">
      <h4>Upload Progress</h4>
      <div
        v-for="(progress, key) in uploadProgress"
        :key="key"
        class="progress-item"
      >
        <span class="progress-label">{{ key }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
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

.progress-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.progress-label {
  min-width: 80px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--ui-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary-500);
  transition: width 0.3s ease;
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
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

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .error-item {
    background: var(--color-red-950);
    border-color: var(--color-red-800);
    color: var(--color-red-300);
  }
}
</style>
