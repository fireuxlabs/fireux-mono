<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'

const route = useRoute()
const raw = route.params.slug
const segments = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : []
const normalized = segments.map((segment) => String(segment || '').trim()).filter(Boolean)
const suffix = normalized.length ? `/${normalized.map(encodeURIComponent).join('/')}` : ''

await navigateTo(`/console/kitchen${suffix}`, { redirectCode: 301 })
</script>
