<template>
  <div class="picker">
    <label v-if="label?.trim()" :for="id" class="picker-label">{{ label }}</label>

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
    </div>

    <div v-if="dataRef" class="actions">
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
        variant="outline"
        color="neutral"
        size="sm"
        @click="clearImage"
      >
        Clear
      </UButton>
    </div>

    <div class="file-info" v-if="fileInfoRef">
      <span class="file-name">{{ fileInfoRef.name }}</span>
      <span class="file-size">{{ fileSizeText }}</span>
      <span v-if="!isValidImage" class="validation-error">
        ⚠️ File too large or invalid type
      </span>
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
// Try to use Nuxt UI toast if available in app context
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
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
    if (toast)
      toast.add({
        title: 'Invalid file',
        description: 'Please select an image file',
        icon: 'i-heroicons-exclamation-triangle',
        color: 'amber',
      })
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
      if (toast)
        toast.add({
          title: 'Processing failed',
          description: 'Please try a different image file',
          icon: 'i-heroicons-x-circle',
          color: 'red',
        })
    })

  // Clear the input so re-selecting the same file triggers change
  input.value = ''
}

// Helper: read a Blob as data URL (flattens nesting)
function readBlobAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Failed to create data URL'))
    }
    reader.onerror = () => reject(new Error('Failed to read processed file'))
    reader.readAsDataURL(blob)
  })
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

        const widthDominant = width > height
        if (widthDominant && width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (!widthDominant && height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Set canvas size
        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob with compression (0.8 quality JPEG)
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }

            // Convert blob back to File
            const processedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })

            try {
              const dataUrl = await readBlobAsDataURL(blob)
              resolve({ dataUrl, file: processedFile })
            } catch (err) {
              reject(err)
            }
          },
          'image/jpeg',
          0.8
        ) // 80% quality
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

.image-container img {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.actions {
  display: flex;
  gap: var(--space-2);
}

.file-info {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.file-name {
  font-weight: 500;
  font-size: 0.875rem;
  text-overflow: ellipsis;
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

/* Color mode spine: docs/concepts/color-mode.md */
:global(:root.dark) .validation-message {
  background: var(--color-red-950);
  border-color: var(--color-red-800);
  color: var(--color-red-300);
}
</style>
