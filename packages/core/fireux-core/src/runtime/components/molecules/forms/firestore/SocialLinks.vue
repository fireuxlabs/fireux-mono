<template>
  <div class="flex w-full flex-col gap-1.5">
    <MoleculesFormsTop
      label="Social Links"
      :is-editing="isEditing"
      :has-data="hasData"
      :error-message="errorMessage"
      @start-editing="startEditing"
      @check="saveChanges"
      @cancel="cancelEditing"
      @delete="deleteValue"
    />

    <div class="grid gap-4">
      <MoleculesFormsFirestoreSocialLink
        v-for="item in socialItems"
        :key="item.platform"
        :id="`social-${item.platform}`"
        :label="item.label"
        :icon="item.icon"
        :is-editing="isEditing"
        :leading="item.leading"
        v-model="localValue[item.platform]"
        @enter="saveChanges"
        @esc="cancelEditing"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { AppSocialLinks } from '../../../../models/core/app.model'

type SocialLinks = AppSocialLinks

const props = defineProps({
  firebaseValue: { type: Object as PropType<SocialLinks>, default: () => ({}) },
  updateFunction: { type: Function, required: true },
})

// Local reactive state
const isEditing = ref(false)
const localValue = ref<Record<string, string>>({})
const errorMessage = ref('')

type SocialPlatform = keyof SocialLinks

const socialItems = [
  {
    platform: 'website',
    label: 'Website',
    icon: 'heroicons:globe-alt',
    leading: 'http://',
    base: 'http://',
  },
  {
    platform: 'twitter',
    label: 'X',
    icon: 'simple-icons:x',
    leading: 'https://x.com/',
    base: 'https://x.com/',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    icon: 'skill-icons:instagram',
    leading: 'https://instagram.com/',
    base: 'https://instagram.com/',
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    icon: 'logos:youtube-icon',
    leading: 'https://youtube.com/',
    base: 'https://youtube.com/',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    icon: 'skill-icons:linkedin',
    leading: 'https://www.linkedin.com/',
    base: 'https://www.linkedin.com/',
  },
  {
    platform: 'github',
    label: 'GitHub',
    icon: 'skill-icons:github-dark',
    leading: 'https://github.com/',
    base: 'https://github.com/',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    icon: 'logos:facebook',
    leading: 'https://facebook.com/',
    base: 'https://facebook.com/',
  },
] as const satisfies ReadonlyArray<{
  platform: SocialPlatform
  label: string
  icon: string
  leading: string
  base: string
}>

const platforms = computed(() => socialItems.map((x) => x.platform))

const baseForPlatform = (platform: SocialPlatform): string => {
  return socialItems.find((x) => x.platform === platform)?.base || ''
}

// Computed properties
const hasData = computed(() => {
  const src = props.firebaseValue || {}
  for (const platform of platforms.value) {
    const raw = (src as any)[platform]
    if (typeof raw === 'string' && raw.trim()) return true
  }
  return false
})

function toEditableWebsite(raw: unknown): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return ''

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      return `${url.host}${url.pathname}${url.search}${url.hash}`
    } catch {
      return value
    }
  }

  return value.replace(/^\/+/, '')
}

function stripPrefixCaseInsensitive(value: string, prefix: string): string {
  if (!prefix) return value
  if (value.toLowerCase().startsWith(prefix.toLowerCase())) {
    return value.slice(prefix.length)
  }
  return value
}

function toEditableSocial(platform: SocialPlatform, raw: unknown): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return ''

  if (platform === 'website') return toEditableWebsite(value)

  // Prefer showing the suffix after the configured base.
  const base = baseForPlatform(platform)
  if (base && /^https?:\/\//i.test(value)) {
    const withoutBase = stripPrefixCaseInsensitive(value, base)
    if (withoutBase !== value) return withoutBase.replace(/^\/+/, '')
  }

  // If it's a URL but not our base, show path+query+hash without leading slash.
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      const combined = `${url.pathname}${url.search}${url.hash}`
      return combined.replace(/^\/+/, '')
    } catch {
      return value
    }
  }

  // Legacy stored suffix.
  return value.replace(/^\/+/, '')
}

function toEditableLinks(value: SocialLinks | null | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  const src = value || {}
  for (const platform of platforms.value) {
    const editable = toEditableSocial(platform, (src as any)[platform])
    if (editable) result[platform] = editable
  }
  return result
}

function normalizeWebsite(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      // Store full URL (validation expects protocol)
      new URL(trimmed)
      return trimmed
    } catch {
      throw new Error('Website is not a valid URL')
    }
  }

  const candidate = `http://${trimmed.replace(/^\/+/, '')}`
  try {
    new URL(candidate)
    return candidate
  } catch {
    throw new Error('Website is not a valid URL')
  }
}

function normalizeSocial(platform: SocialPlatform, raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  if (platform === 'website') return normalizeWebsite(trimmed)

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      new URL(trimmed)
      return trimmed
    } catch {
      throw new Error(`${platform} is not a valid URL`)
    }
  }

  const base = baseForPlatform(platform)
  const candidate = `${base}${trimmed.replace(/^\/+/, '')}`
  try {
    new URL(candidate)
    return candidate
  } catch {
    throw new Error(`${platform} is not a valid URL`)
  }
}

// Watch for prop changes
watch(
  () => props.firebaseValue,
  (newValue: SocialLinks) => {
    if (!isEditing.value) {
      localValue.value = toEditableLinks(newValue)
    }
  },
  { immediate: true, deep: true }
)

// Editing handlers
function startEditing() {
  localValue.value = toEditableLinks(props.firebaseValue)
  errorMessage.value = ''
  isEditing.value = true
}

function cancelEditing() {
  localValue.value = toEditableLinks(props.firebaseValue)
  errorMessage.value = ''
  isEditing.value = false
}

async function saveChanges() {
  try {
    const next: SocialLinks = { ...(props.firebaseValue || {}) }

    for (const platform of platforms.value) {
      const raw = String(localValue.value[platform] ?? '').trim()
      if (!raw) {
        delete (next as any)[platform]
        continue
      }

      try {
        ;(next as any)[platform] = normalizeSocial(platform, raw)
      } catch (e) {
        errorMessage.value =
          e instanceof Error ? e.message : `${platform} is not a valid URL`
        return
      }
    }

    await props.updateFunction(next)
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error saving social links:', error)
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to save social links'
  }
}

async function deleteValue() {
  try {
    const next: SocialLinks = { ...(props.firebaseValue || {}) }
    for (const platform of platforms.value) {
      delete (next as any)[platform]
    }

    await props.updateFunction(next)
    localValue.value = {}
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error deleting social links:', error)
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to delete social links'
  }
}
</script>
