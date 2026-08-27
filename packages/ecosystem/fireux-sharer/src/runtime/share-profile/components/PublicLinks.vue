<template>
  <div
    v-show="links.length"
    class="w-full space-y-6 transition-all duration-700 ease-out motion-reduce:transition-none"
    :class="contentVisible
      ? 'translate-y-0 opacity-100'
      : 'translate-y-3 opacity-0 motion-reduce:translate-y-0'"
  >
      <div class="min-h-20">
        <dl
          v-if="combinedMetrics.length"
          class="share-metrics"
          aria-label="Reported social metrics"
        >
          <div
            v-for="metric in combinedMetrics"
            :key="metric.label"
            class="share-metric"
          >
            <dd class="text-lg font-semibold tracking-tight text-highlighted">
              {{ metric.value }}
            </dd>
            <dt class="mt-0.5 text-xs font-medium uppercase tracking-widest text-muted">
              {{ metric.label }}
            </dt>
          </div>
        </dl>
      </div>

      <div class="share-apps">
        <button
          v-for="link in links"
          :key="link.id"
          type="button"
          class="share-app-card"
          :aria-label="`Show ${link.label} QR code`"
          :title="link.label"
          @click="openLink(link)"
        >
          <span
            class="share-app-icon"
            :style="{ background: platformMeta(link).background }"
          >
            <UIcon :name="platformMeta(link).icon" class="size-7" />
          </span>
        </button>
      </div>

      <UModal
        v-model:open="modalOpen"
        :ui="{ content: 'max-w-sm' }"
      >
        <template #body>
          <div v-if="selectedLink">
            <ProviderGoQrTools
              tool="url"
              :payload="qrPayload"
              bare
            />
          </div>
        </template>
      </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
  ShareProfile,
  ShareProfileLink,
} from '../models/share-profile.model'

const runtime = useRuntimeConfig()
const appId = String(runtime.public?.fireux?.id || '').trim()
const links = ref<ShareProfileLink[]>([])
const selectedLink = ref<ShareProfileLink | null>(null)
const modalOpen = ref(false)
const metricSources = ref<SocialMetrics[]>([])
const contentVisible = ref(false)
const db = useFirestore()
let stopProfile: (() => void) | null = null
let revealFrame = 0

type SocialMetrics = {
  platform: string
  capturedAt: string
  followers?: number
  contentCount?: number
  contentViews?: number
  reactions?: number
  comments?: number
  shares?: number
  profileViews?: number
}

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const combinedMetrics = computed(() => {
  const definitions = [
    { key: 'followers', label: 'Followers' },
    { key: 'contentViews', label: 'Views' },
    { key: 'reactions', label: 'Reactions' },
    { key: 'contentCount', label: 'Content' },
  ] as const
  return definitions.flatMap(({ key, label }) => {
    const values = metricSources.value
      .map((source) => source[key])
      .filter((value): value is number => typeof value === 'number')
    if (!values.length) return []
    return [{ label, value: formatCount(values.reduce((sum, value) => sum + value, 0)) }]
  })
})

const platformStyles: Record<string, { icon: string, background: string }> = {
  youtube: {
    icon: 'i-simple-icons-youtube',
    background: '#ff0033',
  },
  instagram: {
    icon: 'i-simple-icons-instagram',
    background: 'linear-gradient(135deg, #833ab4, #fd1d1d 55%, #fcb045)',
  },
  threads: { icon: 'i-simple-icons-threads', background: '#000000' },
  tiktok: { icon: 'i-simple-icons-tiktok', background: '#000000' },
  snapchat: { icon: 'i-simple-icons-snapchat', background: '#fffc00' },
  facebook: { icon: 'i-simple-icons-facebook', background: '#0866ff' },
  x: { icon: 'i-simple-icons-x', background: '#000000' },
  linkedin: { icon: 'i-simple-icons-linkedin', background: '#0a66c2' },
  twitch: { icon: 'i-simple-icons-twitch', background: '#9146ff' },
  discord: { icon: 'i-simple-icons-discord', background: '#5865f2' },
  website: { icon: 'i-lucide-globe', background: '#52525b' },
  email: { icon: 'i-lucide-mail', background: '#2563eb' },
}

const qrPayload = computed(() => ({
  copy: {
    title: '',
    description: '',
    ctaLabel: 'Show QR code',
    downloadLabel: 'Download QR',
    openTargetLabel: `Open ${selectedLink.value?.label || 'link'}`,
  },
  url: {
    label: '',
    placeholder: '',
    initialValue: selectedQrTarget.value,
    autoGenerate: true,
    invalidMessage: 'This link is not valid.',
  },
  qr: {
    centreLabel: '',
  },
  presentation: {
    qrOnly: true,
  },
}))

const selectedQrTarget = computed(() => {
  const link = selectedLink.value
  if (!link) return ''
  return platformId(link) === 'email'
    ? `mailto:${link.url}`
    : link.url
})

function openLink(link: ShareProfileLink) {
  selectedLink.value = link
  modalOpen.value = true
}

onMounted(() => {
  stopProfile = onSnapshot(
    doc(db, 'share_profiles', appId),
    (snapshot) => {
      if (!snapshot.exists()) {
        links.value = []
        metricSources.value = []
        return
      }
      const profile = snapshot.data() as Partial<ShareProfile>
      links.value = Array.isArray(profile.links) ? profile.links : []
      void enrichYouTube().finally(revealContent)
    },
    () => {
      links.value = []
      metricSources.value = []
    }
  )
})

onBeforeUnmount(() => {
  stopProfile?.()
  cancelAnimationFrame(revealFrame)
})

function revealContent() {
  if (contentVisible.value || !links.value.length) return
  revealFrame = requestAnimationFrame(() => {
    revealFrame = requestAnimationFrame(() => {
      contentVisible.value = true
    })
  })
}

async function enrichYouTube() {
  const youtube = links.value.find((link) => platformId(link) === 'youtube')
  if (!youtube) {
    metricSources.value = metricSources.value.filter((source) => source.platform !== 'youtube')
    return
  }
  const response = await $fetch<{ metrics?: SocialMetrics }>(
    '/api/sharer/youtube-channel',
    { query: { url: youtube.url } }
  ).catch(() => null)
  metricSources.value = [
    ...metricSources.value.filter((source) => source.platform !== 'youtube'),
    ...(response?.metrics ? [response.metrics] : []),
  ]
}

function platformId(link: ShareProfileLink) {
  const label = link.label.trim().toLowerCase()
  if (label) return label.replace(/[^a-z0-9]+/g, '-')
  return link.id
}

function platformMeta(link: ShareProfileLink) {
  return platformStyles[platformId(link)] || {
    icon: 'i-lucide-link',
    background: '#3f3f46',
  }
}

function formatCount(value: number) {
  const number = Number(value)
  return Number.isFinite(number) ? compactNumber.format(number) : value
}
</script>

<style scoped>
.share-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: calc(var(--spacing) * 2);
}

.share-metric {
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 2);
  text-align: center;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: calc(var(--ui-radius) * 2);
  background: rgb(255 255 255 / 0.05);
}

.share-apps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 3);
}

.share-app-card {
  display: block;
  padding: 0;
  border: 0;
  border-radius: calc(var(--ui-radius) * 2);
  background: transparent;
  transition: transform 160ms ease, filter 160ms ease;
}

.share-app-card:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
}

.share-app-icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  flex: none;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 2);
  color: white;
  box-shadow: 0 0.65rem 1.5rem rgb(0 0 0 / 0.2);
}

</style>
