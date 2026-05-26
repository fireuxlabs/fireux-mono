<template>
  <PublicSimplePage
    title="Public doc QR code"
    description="Upload one public document, publish it at a stable link, and get a QR page people can scan."
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <section class="space-y-4">
        <UBadge color="primary" variant="soft">
          Live
        </UBadge>
        <p class="text-base leading-7 text-muted">
          Use this when a menu, notice, guide, form, poster, or printed handout needs a phone-friendly QR code.
          Go QR hosts the public file, gives it a short path, and creates the QR page for that path.
        </p>

        <ClientOnly>
          <GoQrUploadPanel class="max-w-xl" />
        </ClientOnly>
      </section>

      <UCard variant="subtle">
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">
            Use Go QR from another app
          </h2>
        </template>

        <div class="space-y-4">
          <p class="text-sm leading-6 text-muted">
            Other FireUX apps can treat Go QR like a provider. The consuming app keeps its own page and
            wording, while Go QR owns the document upload, slug check, public link, QR route, and limit rules.
          </p>

          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="endpoint in endpoints"
              :key="endpoint.path"
              class="rounded-md border border-default bg-default p-3"
            >
              <div class="flex items-center gap-2">
                <UBadge color="neutral" variant="soft">
                  {{ endpoint.method }}
                </UBadge>
                <code class="break-all text-sm text-highlighted">
                  {{ endpoint.path }}
                </code>
              </div>
              <p class="mt-2 text-xs leading-5 text-muted">
                {{ endpoint.description }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <UCard variant="subtle">
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">
            API example
          </h2>
        </template>

        <div class="space-y-4">
          <div class="overflow-hidden rounded-md border border-default bg-elevated">
            <div class="border-b border-default px-4 py-2 text-xs font-medium uppercase text-muted">
              Client wrapper shape
            </div>
            <pre class="overflow-x-auto p-4 text-sm leading-6"><code>{{ clientExample }}</code></pre>
          </div>

          <div class="overflow-hidden rounded-md border border-default bg-elevated">
            <div class="border-b border-default px-4 py-2 text-xs font-medium uppercase text-muted">
              Multipart request
            </div>
            <pre class="overflow-x-auto p-4 text-sm leading-6"><code>{{ requestExample }}</code></pre>
          </div>

          <div class="overflow-hidden rounded-md border border-default bg-elevated">
            <div class="border-b border-default px-4 py-2 text-xs font-medium uppercase text-muted">
              Create response
            </div>
            <pre class="overflow-x-auto p-4 text-sm leading-6"><code>{{ responseExample }}</code></pre>
          </div>
        </div>
      </UCard>

      <UCard variant="subtle">
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">
            Provider contract roadmap
          </h2>
        </template>

        <ul class="space-y-3 text-sm leading-6 text-muted">
          <li
            v-for="item in roadmap"
            :key="item"
            class="flex gap-3"
          >
            <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </UCard>
    </div>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
})

const endpoints = [
  {
    method: 'GET',
    path: '/api/public/app/info',
    description: 'Read Go QR app identity, public branding, and media from the shared FireUX app-info endpoint.',
  },
  {
    method: 'GET',
    path: '/api/docs/availability?id=my-doc',
    description: 'Check whether a public document path is valid and available before creating it.',
  },
  {
    method: 'POST',
    path: '/api/docs/create',
    description: 'Upload a public file with a slug and optional type, then receive the public page and QR route.',
  },
  {
    method: 'GET',
    path: '/:slug/qr',
    description: 'Open the generated QR page for printing, sharing, or scanning.',
  },
]

const roadmap = [
  'Wrap the current document endpoints in a typed Go QR provider client.',
  'Expose stable tool contracts such as public-doc and food-menu for consumer apps.',
  'Return app/provider identity from the existing FireUX app-info endpoint instead of duplicating brand data.',
  'Add anonymous usage limits so a visitor can create one public QR doc before signing in for more.',
]

const clientExample = `const goQr = createGoQrClient({
  baseUrl: 'https://go-qr.web.app'
})

const appInfo = await goQr.appInfo()
const availability = await goQr.publicDoc.availability('my-public-doc')

if (availability.available) {
  const result = await goQr.publicDoc.create({
    slug: 'my-public-doc',
    file
  })
}`

const requestExample = `const form = new FormData()
form.append('slug', 'my-public-doc')
form.append('file', file)

const result = await fetch('https://go-qr.web.app/api/docs/create', {
  method: 'POST',
  body: form
}).then((response) => response.json())`

const responseExample = `{
  "ok": true,
  "slug": "my-public-doc",
  "path": "/my-public-doc",
  "qr_path": "/my-public-doc/qr"
}`

useSeoMeta({
  title: 'Public Doc QR Code - Go QR',
  ogTitle: 'Public Doc QR Code - Go QR',
  twitterTitle: 'Public Doc QR Code - Go QR',
  description: 'Upload one public document, publish it at a stable link, and get a QR page people can scan. Includes notes for apps that want to use Go QR as a provider.',
  ogDescription: 'Upload one public document, publish it at a stable link, and get a QR page people can scan. Includes notes for apps that want to use Go QR as a provider.',
  twitterDescription: 'Upload one public document, publish it at a stable link, and get a QR page people can scan. Includes notes for apps that want to use Go QR as a provider.',
})
</script>
