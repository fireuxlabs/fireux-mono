<template>
  <div class="form-field">
    <!-- Top Section: Label, Icons, and Error Handling -->
    <FireMoleculesFormsTop
      label="Social Links"
      :is-editing="isEditing"
      :has-data="hasData"
      :error-message="errorMessage"
      @start-editing="startEditing"
      @check="saveChanges"
      @cancel="cancelEditing"
      @delete="deleteValue"
    />

    <!-- Display Mode -->
    <div v-if="!isEditing" class="display">
      <div v-if="hasData" class="social-links-display">
        <div
          v-for="(url, platform) in firebaseValue"
          :key="platform"
          class="social-link-item"
        >
          <UIcon :name="getSocialIcon(platform)" class="social-icon" />
          <div class="social-link-content">
            <span class="social-platform-label">{{ platform }}:</span>
            <a :href="url" target="_blank" class="social-link-url">
              {{ url }}
            </a>
          </div>
        </div>
      </div>
      <span v-else class="no-links-message">No social links added</span>
    </div>

    <!-- Edit Mode -->
    <div v-else class="editing">
      <div
        v-for="platform in socialPlatforms"
        :key="platform"
        class="social-input-group"
      >
        <label class="social-input-label">
          <UIcon :name="getSocialIcon(platform)" class="social-input-icon" />
          <span class="social-input-text">{{ platform }} URL</span>
        </label>
        <UInput
          v-model="localValue[platform]"
          :placeholder="getSocialPlaceholder(platform)"
          class="social-input"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEditing"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  firebaseValue: { type: Object, default: () => ({}) },
  updateFunction: { type: Function, required: true },
})

// Local reactive state
const isEditing = ref(false)
const localValue = ref({})
const errorMessage = ref('')

// Social platforms to support
const socialPlatforms = [
  'website',
  'twitter',
  'linkedin',
  'github',
  'instagram',
  'facebook',
  'youtube',
]

// Computed properties
const hasData = computed(() => {
  return Object.keys(props.firebaseValue || {}).some((key) =>
    props.firebaseValue[key]?.trim()
  )
})

// Helper functions
function getSocialIcon(platform) {
  const icons = {
    website: 'i-heroicons-globe-alt',
    twitter: 'i-simple-icons-twitter',
    linkedin: 'i-simple-icons-linkedin',
    github: 'i-simple-icons-github',
    instagram: 'i-simple-icons-instagram',
    facebook: 'i-simple-icons-facebook',
    youtube: 'i-simple-icons-youtube',
  }
  return icons[platform] || 'i-heroicons-link'
}

function getSocialPlaceholder(platform) {
  const placeholders = {
    website: 'https://example.com',
    twitter: 'https://twitter.com/username',
    linkedin: 'https://linkedin.com/in/username',
    github: 'https://github.com/username',
    instagram: 'https://instagram.com/username',
    facebook: 'https://facebook.com/username',
    youtube: 'https://youtube.com/@username',
  }
  return placeholders[platform] || 'https://example.com'
}

// Watch for prop changes
watch(
  () => props.firebaseValue,
  (newValue) => {
    if (!isEditing.value) {
      localValue.value = { ...newValue } || {}
    }
  },
  { immediate: true, deep: true }
)

// Editing handlers
function startEditing() {
  localValue.value = { ...props.firebaseValue } || {}
  errorMessage.value = ''
  isEditing.value = true
}

function cancelEditing() {
  localValue.value = { ...props.firebaseValue } || {}
  errorMessage.value = ''
  isEditing.value = false
}

async function saveChanges() {
  try {
    // Filter out empty values and validate URLs
    const validatedLinks = {}

    for (const [platform, url] of Object.entries(localValue.value)) {
      if (url && url.trim()) {
        const trimmedUrl = url.trim()

        // Basic URL validation
        if (
          !trimmedUrl.startsWith('http://') &&
          !trimmedUrl.startsWith('https://')
        ) {
          errorMessage.value = `${platform} URL must start with http:// or https://`
          return
        }

        try {
          new URL(trimmedUrl) // Validate URL format
          validatedLinks[platform] = trimmedUrl
        } catch {
          errorMessage.value = `${platform} URL is not a valid URL`
          return
        }
      }
    }

    await props.updateFunction(validatedLinks)
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error saving social links:', error)
    errorMessage.value = error.message || 'Failed to save social links'
  }
}

async function deleteValue() {
  try {
    await props.updateFunction({})
    localValue.value = {}
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error deleting social links:', error)
    errorMessage.value = error.message || 'Failed to delete social links'
  }
}
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.display {
  padding: var(--space-3) 0;
  min-height: var(--space-10);
  display: flex;
  align-items: center;
}

.editing {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.social-links-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.social-link-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.social-icon {
  width: var(--space-5);
  height: var(--space-5);
  color: #6b7280;
  flex-shrink: 0;
}

.social-link-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
  min-width: 0;
}

@media (min-width: 640px) {
  .social-link-content {
    flex-direction: row;
    align-items: center;
    gap: var(--space-2);
  }
}

.social-platform-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  text-transform: capitalize;
  flex-shrink: 0;
}

.social-link-url {
  color: #2563eb;
  text-decoration: none;
  word-break: break-all;
  transition: color 0.2s ease;
}

.social-link-url:hover {
  color: #1d4ed8;
}

.social-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.social-input-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.social-input-icon {
  width: var(--space-4);
  height: var(--space-4);
  flex-shrink: 0;
}

.social-input-text {
  text-transform: capitalize;
}

.social-input {
  width: 100%;
}

.no-links-message {
  color: #6b7280;
}
</style>
