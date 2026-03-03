<template>
  <div class="flex w-full flex-col gap-1.5">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm font-semibold text-default">Social Links</p>
      <span v-if="!hasData" class="text-xs text-dimmed italic">none</span>
    </div>

    <div class="grid gap-4">
      <div v-for="item in socialItems" :key="item.platform" class="grid gap-2">
        <MoleculesFormsFirestoreSocialLink
          :id="`social-${item.platform}`"
          :label="item.label"
          :icon="item.icon"
          :is-editing="editingPlatform === item.platform"
          :leading="item.leading"
          :display-value="displayUrl(item.platform)"
          :model-value="draftValue(item.platform)"
          @update:model-value="(v: unknown) => setDraft(item.platform, v)"
          @enter="savePlatform(item.platform)"
          @esc="cancelPlatform(item.platform)"
        >
          <template #actions>
            <template v-if="editingPlatform !== item.platform">
              <UTooltip text="Edit" :popper="{ placement: 'top' }">
                <UButton
                  aria-label="Edit"
                  color="primary"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-pencil"
                  @click="startPlatform(item.platform)"
                />
              </UTooltip>
            </template>

            <template v-else>
              <UTooltip text="Save" :popper="{ placement: 'top' }">
                <UButton
                  aria-label="Save"
                  color="success"
                  variant="soft"
                  size="xs"
                  icon="i-lucide-check"
                  @click="savePlatform(item.platform)"
                />
              </UTooltip>
              <UTooltip text="Cancel" :popper="{ placement: 'top' }">
                <UButton
                  aria-label="Cancel"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-undo-2"
                  @click="cancelPlatform(item.platform)"
                />
              </UTooltip>
              <UTooltip v-if="displayUrl(item.platform)" text="Clear" :popper="{ placement: 'top' }">
                <UButton
                  aria-label="Clear"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-trash-2"
                  @click="clearPlatform(item.platform)"
                />
              </UTooltip>
            </template>
          </template>
        </MoleculesFormsFirestoreSocialLink>

        <UAlert
          v-if="rowError[item.platform]"
          :title="rowError[item.platform]"
          color="error"
          variant="soft"
          icon="i-lucide-alert-triangle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { AppSocialLinks } from '../../../../models/core/supporting/app'
import { createEmptyAppSocialLinks } from '../../../../composables/fireux/firestore/core/app/utils/factories/createEmptyAppSocialLinks'

type SocialLinks = AppSocialLinks

const props = defineProps({
  firebaseValue: {
    type: Object as PropType<SocialLinks>,
    default: () => createEmptyAppSocialLinks(),
  },
  updateFunction: { type: Function, required: true },
})

type SocialPlatform = keyof SocialLinks

const editingPlatform = ref<SocialPlatform | null>(null)
const draft = ref<Record<string, string>>({})
const rowError = ref<Record<string, string>>({})

function draftValue(platform: SocialPlatform): string {
  return String(draft.value[platform] ?? '')
}

function setDraft(platform: SocialPlatform, value: unknown) {
  draft.value = { ...draft.value, [platform]: String(value ?? '') }
}

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
    icon: 'logos:x',
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

function toDisplayUrl(platform: SocialPlatform, raw: unknown): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value

  const base = baseForPlatform(platform)
  const suffix = value.replace(/^\/+/, '')
  return `${base}${suffix}`
}

function displayUrl(platform: SocialPlatform): string {
  return toDisplayUrl(platform, (props.firebaseValue as any)?.[platform])
}

// Watch for prop changes
watch(
  () => props.firebaseValue,
  (newValue: SocialLinks) => {
    // Keep draft synced for non-editing rows (so opening edit reflects latest).
    const nextDraft = { ...draft.value }
    for (const platform of platforms.value) {
      if (editingPlatform.value === platform) continue
      const editable = toEditableSocial(platform, (newValue as any)?.[platform])
      if (editable) nextDraft[platform] = editable
      else delete nextDraft[platform]
    }
    draft.value = nextDraft
  },
  { immediate: true, deep: true }
)

function startPlatform(platform: SocialPlatform) {
  editingPlatform.value = platform
  rowError.value = { ...rowError.value, [platform]: '' }
  draft.value = {
    ...draft.value,
    [platform]: toEditableSocial(platform, (props.firebaseValue as any)?.[platform]),
  }
}

function cancelPlatform(platform: SocialPlatform) {
  if (editingPlatform.value === platform) editingPlatform.value = null
  rowError.value = { ...rowError.value, [platform]: '' }
  draft.value = {
    ...draft.value,
    [platform]: toEditableSocial(platform, (props.firebaseValue as any)?.[platform]),
  }
}

async function savePlatform(platform: SocialPlatform) {
  try {
    const raw = String(draft.value[platform] ?? '')
    const next: SocialLinks = {
      ...createEmptyAppSocialLinks(),
      ...(props.firebaseValue || createEmptyAppSocialLinks()),
    }

    const normalized = normalizeSocial(platform, raw)
    ;(next as any)[platform] = normalized

    await props.updateFunction(next)
    rowError.value = { ...rowError.value, [platform]: '' }
    if (editingPlatform.value === platform) editingPlatform.value = null
  } catch (e) {
    rowError.value = {
      ...rowError.value,
      [platform]: e instanceof Error ? e.message : `${platform} is not a valid URL`,
    }
  }
}

async function clearPlatform(platform: SocialPlatform) {
  try {
    const next: SocialLinks = {
      ...createEmptyAppSocialLinks(),
      ...(props.firebaseValue || createEmptyAppSocialLinks()),
    }
    ;(next as any)[platform] = ''
    await props.updateFunction(next)

    const nextDraft = { ...draft.value }
    delete nextDraft[platform]
    draft.value = nextDraft
    rowError.value = { ...rowError.value, [platform]: '' }
    if (editingPlatform.value === platform) editingPlatform.value = null
  } catch (e) {
    rowError.value = {
      ...rowError.value,
      [platform]: e instanceof Error ? e.message : `${platform} is not a valid URL`,
    }
  }
}
</script>
