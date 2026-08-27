import { useRuntimeConfig } from '#imports'
import { defineEventHandler, getQuery } from 'h3'

type YouTubeChannel = {
  id: string
  snippet?: {
    title?: string
    thumbnails?: Record<string, { url?: string }>
  }
  statistics?: {
    viewCount?: string
    subscriberCount?: string
    hiddenSubscriberCount?: boolean
    videoCount?: string
  }
  contentDetails?: { relatedPlaylists?: { uploads?: string } }
}

type YouTubeResponse = {
  items?: YouTubeChannel[]
}

type SocialMetrics = {
  platform: 'youtube'
  capturedAt: string
  followers?: number
  contentCount?: number
  contentViews?: number
  reactions?: number
  comments?: number
}

type CachedResult = { channel: YouTubeChannel, metrics: SocialMetrics }
const cache = new Map<string, { expires: number, result: CachedResult }>()
const CACHE_MS = 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const source = String(getQuery(event).url || '').trim()
  const identity = youtubeIdentity(source)
  if (!identity) return { channel: null }

  const cached = cache.get(identity.value)
  if (cached && cached.expires > Date.now()) return cached.result

  const runtime = useRuntimeConfig(event)
  const apiKey = String(runtime.sharer?.youtubeApiKey || '').trim()
  if (!apiKey) return { channel: null }

  const response = await $fetch<YouTubeResponse>(
    'https://www.googleapis.com/youtube/v3/channels',
    {
      query: {
        part: 'snippet,statistics,contentDetails',
        fields: 'items(id,snippet(title,thumbnails),statistics,contentDetails(relatedPlaylists(uploads)))',
        [identity.kind]: identity.value,
        key: apiKey,
      },
    }
  ).catch(() => null)
  const channel = response?.items?.[0]
  if (!channel) return { channel: null }

  const engagement = await youtubeEngagement(
    channel.contentDetails?.relatedPlaylists?.uploads,
    apiKey
  )
  const result = { channel, metrics: youtubeMetrics(channel, engagement) }
  cache.set(identity.value, { expires: Date.now() + CACHE_MS, result })
  return result
})

async function youtubeEngagement(playlistId: string | undefined, apiKey: string) {
  if (!playlistId) return null
  const videoIds: string[] = []
  let pageToken = ''
  do {
    const page = await $fetch<{
      nextPageToken?: string
      items?: Array<{ contentDetails?: { videoId?: string } }>
    }>('https://www.googleapis.com/youtube/v3/playlistItems', {
      query: {
        part: 'contentDetails', playlistId, maxResults: 50,
        pageToken: pageToken || undefined,
        fields: 'nextPageToken,items(contentDetails(videoId))', key: apiKey,
      },
    }).catch(() => null)
    if (!page) return null
    for (const item of page.items || []) {
      const videoId = item.contentDetails?.videoId
      if (videoId) videoIds.push(videoId)
    }
    pageToken = page.nextPageToken || ''
  } while (pageToken)

  const chunks = Array.from(
    { length: Math.ceil(videoIds.length / 50) },
    (_, index) => videoIds.slice(index * 50, index * 50 + 50)
  )
  const pages = await Promise.all(chunks.map((ids) =>
    $fetch<{
      items?: Array<{ statistics?: { likeCount?: string, commentCount?: string } }>
    }>('https://www.googleapis.com/youtube/v3/videos', {
      query: {
        part: 'statistics', id: ids.join(','),
        fields: 'items(statistics(likeCount,commentCount))', key: apiKey,
      },
    }).catch(() => null)
  ))
  if (pages.some((page) => !page)) return null

  let reactions = 0
  let comments = 0
  for (const page of pages) {
    for (const item of page?.items || []) {
      reactions += numeric(item.statistics?.likeCount) || 0
      comments += numeric(item.statistics?.commentCount) || 0
    }
  }
  return { reactions, comments }
}

function youtubeMetrics(
  channel: YouTubeChannel,
  engagement: { reactions: number, comments: number } | null
): SocialMetrics {
  const statistics = channel.statistics
  const followers = statistics?.hiddenSubscriberCount
    ? null
    : numeric(statistics?.subscriberCount)
  const contentCount = numeric(statistics?.videoCount)
  const contentViews = numeric(statistics?.viewCount)
  return {
    platform: 'youtube',
    capturedAt: new Date().toISOString(),
    ...(followers != null ? { followers } : {}),
    ...(contentCount != null ? { contentCount } : {}),
    ...(contentViews != null ? { contentViews } : {}),
    ...(engagement || {}),
  }
}

function numeric(value: string | undefined) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null
}

function youtubeIdentity(source: string) {
  try {
    const url = new URL(source)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (!['youtube.com', 'm.youtube.com'].includes(host)) return null
    const parts = url.pathname.split('/').filter(Boolean)
    const first = parts[0] || ''
    if (first.startsWith('@')) return { kind: 'forHandle', value: first }
    if (first === 'channel' && parts[1]) return { kind: 'id', value: parts[1] }
    return null
  } catch {
    return null
  }
}
