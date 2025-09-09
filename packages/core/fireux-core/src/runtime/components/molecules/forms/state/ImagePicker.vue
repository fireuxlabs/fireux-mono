<template>
  <div class="picker">
    <label :for="id" class="picker-label">{{ label }}</label>

    <!-- Hidden file input -->
    <input
      :id="id"
      ref="inputRef"
      type="file"
      accept="image/*"
      class="hidden-input"
      @change="onSelect"
    />

    <!-- Preview -->
    <div class="image-container" v-if="dataRef">
      <img :src="dataRef" :alt="`${label} preview`" />

      <!-- Floating action buttons on top of image -->
      <div class="floating-actions">
        <UButton
          icon="i-lucide-image-up"
          variant="solid"
          color="primary"
          size="sm"
          @click="trigger"
        >
          Change
        </UButton>
        <UButton
          icon="i-lucide-x"
          variant="solid"
          color="red"
          size="sm"
          @click="clearImage"
        >
          Clear
        </UButton>
      </div>

      <!-- File info overlay -->
      <div class="file-info" v-if="fileInfoRef">
        <span class="file-name">{{ fileInfoRef.name }}</span>
        <span class="file-size">{{ fileSizeText }}</span>
        <span v-if="!isValidImage" class="validation-error">
          ⚠️ File too large or invalid type
        </span>
      </div>
    </div>

    <!-- Upload trigger - only show when no image -->
    <div class="upload-controls" v-if="!dataRef">
      <UButton icon="i-lucide-image-up" variant="subtle" @click="trigger">
        Upload Image
      </UButton>
    </div>

    <!-- Validation message -->
    <div v-if="fileInfoRef && !isValidImage" class="validation-message">
      <UIcon name="i-lucide-alert-triangle" />
      <span>Image processing failed. Please try a different image file.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'

const props = defineProps<{
  label: string
  stateKey: string
}>()

// Store both base64 data and file metadata
const dataRef = useStorage<string>(`${props.stateKey}Data`, '')
const fileInfoRef = useStorage<{
  name: string
  size: number
  type: string
  lastModified: number
} | null>(`${props.stateKey}FileInfo`, null)

// Store the actual file in a reactive ref (not persisted)
const currentFile = ref<File | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const id = `upload-${props.stateKey}`

// Validation - more lenient since we process images
const isValidImage = computed(() => {
  if (!fileInfoRef.value) return true
  const maxSize = 5 * 1024 * 1024 // 5MB (after processing)
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return (
    fileInfoRef.value.size <= maxSize &&
    validTypes.includes(fileInfoRef.value.type)
  )
})

const fileSizeText = computed(() => {
  if (!fileInfoRef.value) return ''
  const sizeInMB = (fileInfoRef.value.size / (1024 * 1024)).toFixed(2)
  return `${sizeInMB}MB`
})

// Expose the file for parent components to access
defineExpose({
  getFile: () => currentFile.value,
  getDataUrl: () => dataRef.value,
  getFileInfo: () => fileInfoRef.value,
  clear: clearImage,
})

function trigger() {
  inputRef.value?.click()
}

function clearImage() {
  dataRef.value = ''
  fileInfoRef.value = null
  currentFile.value = null
}

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    dataRef.value = ''
    fileInfoRef.value = null
    currentFile.value = null
    return
  }

  // Check if it's an image file
  if (!file.type.startsWith('image/')) {
    console.error('❌ File is not an image')
    alert('Please select an image file')
    input.value = ''
    return
  }

  // Process the image (resize and convert)
  processImage(file)
    .then((processedData) => {
      if (processedData) {
        dataRef.value = processedData.dataUrl
        currentFile.value = processedData.file
        fileInfoRef.value = {
          name: file.name,
          size: processedData.file.size,
          type: 'image/jpeg', // Always convert to JPEG
          lastModified: file.lastModified,
        }
        console.log('✅ Image processed successfully:', {
          originalSize: file.size,
          newSize: processedData.file.size,
          compression:
            (((file.size - processedData.file.size) / file.size) * 100).toFixed(
              1
            ) + '%',
        })
      }
    })
    .catch((error) => {
      console.error('❌ Error processing image:', error)
      alert('Failed to process image. Please try a different file.')
    })

  // Clear the input so re-selecting the same file triggers change
  input.value = ''
}

// Image processing function
async function processImage(
  file: File
): Promise<{ dataUrl: string; file: File } | null> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      try {
        // Create canvas for resizing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Calculate new dimensions (max 800px width, maintain aspect ratio)
        const maxWidth = 800
        const maxHeight = 800
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Set canvas size
        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob with compression (0.8 quality JPEG)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }

            // Convert blob back to File
            const processedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })

            // Create data URL for preview
            const reader = new FileReader()
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve({
                  dataUrl: reader.result,
                  file: processedFile,
                })
              } else {
                reject(new Error('Failed to create data URL'))
              }
            }
            reader.onerror = () =>
              reject(new Error('Failed to read processed file'))
            reader.readAsDataURL(processedFile)
          },
          'image/jpeg',
          0.8 // 80% quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
</script>

<style scoped>
.hidden-input {
  display: none;
}

.picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.picker-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.image-container {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid var(--ui-border);
  background: var(--ui-bg-elevated);
}

.floating-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  z-index: 20;
  opacity: 0.9;
}

.floating-actions:hover {
  opacity: 1;
}

.image-container:hover .floating-actions {
  opacity: 1;
}

.image-container img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.file-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  font-size: 0.875rem;
  truncate: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.file-size {
  font-size: 0.75rem;
  opacity: 0.8;
}

.validation-error {
  color: var(--color-red-400);
  font-size: 0.75rem;
  font-weight: 500;
}

.upload-controls {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.validation-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--radius-sm);
  color: var(--color-red-700);
  font-size: 0.875rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .validation-message {
    background: var(--color-red-950);
    border-color: var(--color-red-800);
    color: var(--color-red-300);
  }
}
</style>
