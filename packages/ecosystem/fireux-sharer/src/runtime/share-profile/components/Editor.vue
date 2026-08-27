<template>
  <UCard>
    <div class="fx-list-stack">
      <div>
        <div class="divide-y divide-default">
          <div
            v-for="platform in commonPlatforms"
            :key="platform.label"
            class="grid items-center gap-3 py-3 sm:grid-cols-[9rem_minmax(0,1fr)]"
          >
            <div class="flex items-center gap-3 font-medium text-highlighted">
              <UIcon :name="platform.icon" class="size-5 shrink-0" />
              <span>{{ platform.label }}</span>
            </div>
            <UInput
              :model-value="platformUrl(platform.label)"
              :type="platform.inputType || 'url'"
              :aria-label="platform.inputType === 'email' ? `${platform.label} address` : `${platform.label} URL`"
              :placeholder="platform.placeholder"
              @update:model-value="setPlatformUrl(platform.label, $event)"
            />
          </div>
        </div>
      </div>

      <div
        v-for="item in customLinks"
        :key="item.link.id"
        class="grid gap-3 md:grid-cols-[1fr_2fr_auto]"
      >
        <UFormField label="Platform">
          <UInput v-model="item.link.label" placeholder="Platform" />
        </UFormField>
        <UFormField label="URL">
          <UInput
            v-model="item.link.url"
            type="url"
            placeholder="https://example.com"
          />
        </UFormField>
        <UButton
          class="self-end"
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          label="Remove"
          @click="removeLink(item.index)"
        />
      </div>

      <p v-if="!profile.links.length" class="text-muted">
        No social links yet.
      </p>

      <div class="flex flex-wrap gap-3">
        <UButton
          variant="soft"
          icon="i-lucide-plus"
          label="Add custom link"
          @click="addLink"
        />
        <UButton
          icon="i-lucide-save"
          label="Save profile"
          :loading="saving"
          @click="save"
        />
      </div>

      <UAlert v-if="message" :color="messageKind" :title="message" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  emptyShareProfile,
  type ShareProfile,
} from '../models/share-profile.model'

const runtime = useRuntimeConfig()
const appId = String(runtime.public?.fireux?.id || '').trim()
const db = useFirestore()
const { currentUser } = useAuth()
const profile = reactive<ShareProfile>(emptyShareProfile(appId))
const saving = ref(false)
const message = ref('')
const messageKind = ref<'success' | 'error'>('success')
const profileRef = () => doc(db, 'share_profiles', appId)
const commonPlatforms = [
  {
    label: 'YouTube',
    icon: 'i-simple-icons-youtube',
    placeholder: 'https://youtube.com/@handle',
  },
  {
    label: 'TikTok',
    icon: 'i-simple-icons-tiktok',
    placeholder: 'https://tiktok.com/@handle',
  },
  {
    label: 'Instagram',
    icon: 'i-simple-icons-instagram',
    placeholder: 'https://instagram.com/handle',
  },
  {
    label: 'Threads',
    icon: 'i-simple-icons-threads',
    placeholder: 'https://threads.com/@handle',
  },
  {
    label: 'Snapchat',
    icon: 'i-simple-icons-snapchat',
    placeholder: 'https://snapchat.com/add/handle',
  },
  {
    label: 'Facebook',
    icon: 'i-simple-icons-facebook',
    placeholder: 'https://facebook.com/handle',
  },
  { label: 'X', icon: 'i-simple-icons-x', placeholder: 'https://x.com/handle' },
  {
    label: 'LinkedIn',
    icon: 'i-simple-icons-linkedin',
    placeholder: 'https://linkedin.com/in/handle',
  },
  {
    label: 'Twitch',
    icon: 'i-simple-icons-twitch',
    placeholder: 'https://twitch.tv/handle',
  },
  {
    label: 'Discord',
    icon: 'i-simple-icons-discord',
    placeholder: 'https://discord.gg/invite',
  },
  {
    label: 'Website',
    icon: 'i-lucide-globe',
    placeholder: 'https://example.com',
  },
  {
    label: 'Email',
    icon: 'i-lucide-mail',
    placeholder: 'hello@example.com',
    inputType: 'email',
  },
] as const

const commonPlatformKeys = new Set(
  commonPlatforms.map((platform) => platform.label.toLowerCase())
)
const customLinks = computed(() =>
  profile.links
    .map((link, index) => ({ link, index }))
    .filter(({ link }) => !commonPlatformKeys.has(link.label.toLowerCase()))
)

function platformUrl(label: string) {
  return (
    profile.links.find(
      (link) => link.label.toLowerCase() === label.toLowerCase()
    )?.url || ''
  )
}

function setPlatformUrl(label: string, value: string | number) {
  const url = String(value || '')
  const index = profile.links.findIndex(
    (link) => link.label.toLowerCase() === label.toLowerCase()
  )
  if (index >= 0) {
    if (url) {
      profile.links[index]!.id = platformId(label)
      profile.links[index]!.url = url
    }
    else profile.links.splice(index, 1)
    return
  }
  if (url) profile.links.push({ id: crypto.randomUUID(), label, url })
}

function addLink() {
  if (profile.links.length >= 10) {
    messageKind.value = 'error'
    message.value = 'A Share Profile can contain up to 10 links.'
    return
  }
  profile.links.push({ id: crypto.randomUUID(), label: '', url: '' })
}

function removeLink(index: number) {
  profile.links.splice(index, 1)
}

function validatedLinks() {
  return profile.links.map((link) => {
    const label = link.label.trim()
    const url = link.url.trim()
    if (!label || !url) throw new Error('Every link needs a platform and URL.')
    if (label.toLowerCase() === 'email') {
      if (!isEmailAddress(url)) {
        throw new Error('Email needs a valid address.')
      }
      return { id: 'email', label: 'Email', url: url.toLowerCase() }
    }
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Links must use http:// or https://.')
    }
    const isCommon = commonPlatformKeys.has(label.toLowerCase())
    return {
      id: isCommon ? platformId(label) : link.id,
      label,
      url: parsed.toString(),
    }
  })
}

async function load() {
  try {
    const snapshot = await getDoc(profileRef())
    if (!snapshot.exists()) return
    const stored = snapshot.data() as Partial<ShareProfile>
    profile.links = Array.isArray(stored.links) ? stored.links : []
  } catch (error) {
    messageKind.value = 'error'
    message.value =
      error instanceof Error ? error.message : 'Profile could not be loaded.'
  }
}

async function save() {
  message.value = ''
  saving.value = true
  try {
    const uid = currentUser.value?.uid
    if (!uid || currentUser.value?.isAnonymous)
      throw new Error('Sign in before saving.')
    const links = validatedLinks()
    const token = await currentUser.value.getIdToken()
    const response = await fetch('/api/internal/share-profile', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ links }),
    })
    const result = (await response.json().catch(() => null)) as {
      statusMessage?: unknown
      message?: unknown
    } | null
    if (!response.ok) {
      throw new Error(
        String(result?.statusMessage || result?.message || '').trim() ||
          `Profile could not be saved (${response.status}).`
      )
    }
    profile.links = links
    messageKind.value = 'success'
    message.value = 'Profile saved.'
  } catch (error) {
    messageKind.value = 'error'
    message.value =
      error instanceof Error ? error.message : 'Profile could not be saved.'
  } finally {
    saving.value = false
  }
}

onMounted(load)

function platformId(label: string) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function isEmailAddress(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
</script>
