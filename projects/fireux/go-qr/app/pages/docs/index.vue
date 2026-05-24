<template>
  <main class="min-h-screen bg-default text-default" data-entity-cta-family="utility-managed">
    <UContainer class="py-6 sm:py-8">
      <div class="mx-auto max-w-3xl space-y-5">
        <header class="flex items-center justify-between gap-3 border-b border-default pb-4">
          <div>
            <NuxtLink to="/" class="text-xs font-semibold uppercase tracking-wide text-primary">
              Go QR
            </NuxtLink>
            <h1 class="text-2xl font-semibold text-highlighted">
              Documents
            </h1>
          </div>

          <UButton
            to="/"
            icon="i-lucide-upload"
            size="sm"
          >
            New
          </UButton>
        </header>

        <div
          v-if="!documents.length"
          class="rounded-md border border-dashed border-default p-8 text-center text-sm text-muted"
        >
          No public documents yet.
        </div>

        <div v-else class="divide-y divide-default rounded-md border border-default bg-default">
          <article
            v-for="document in documents"
            :key="document.id"
            class="flex items-center justify-between gap-4 p-4"
          >
            <NuxtLink
              :to="`/docs/${encodeURIComponent(document.slug)}`"
              class="min-w-0"
            >
              <h2 class="truncate font-medium text-highlighted">
                {{ document.slug }}
              </h2>
            </NuxtLink>

            <div class="flex shrink-0 items-center gap-1">
              <UButton
                :to="`/docs/${encodeURIComponent(document.slug)}`"
                icon="i-lucide-file-text"
                variant="ghost"
                color="neutral"
                aria-label="Open document"
              />
              <UButton
                :to="`/docs/${encodeURIComponent(document.slug)}/qr`"
                icon="i-lucide-qr-code"
                variant="ghost"
                color="neutral"
                aria-label="Open QR"
              />
              <ClientOnly>
                <UButton
                  v-if="isAdmin"
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  color="error"
                  :loading="deletingSlug === document.slug"
                  :aria-label="`Delete ${document.slug}`"
                  @click="deleteDocument(document)"
                />
              </ClientOnly>
            </div>
          </article>
        </div>

        <p v-if="deleteError" class="text-sm text-error">
          {{ deleteError }}
        </p>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import {
  createError,
  useAsyncData,
  useSeoMeta,
} from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref } from 'vue'

type PublicGoQrRecord = {
  id: string
  slug: string
  file_type: string
  file_name: string
}

const { currentUser } = useAuth()
const { isAdmin } = useUser()
const deletingSlug = ref('')
const deleteError = ref('')

definePageMeta({
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const { data, refresh } = await useAsyncData(
  'go-qr-documents-index',
  () => $fetch<{ documents: PublicGoQrRecord[] }>('/api/docs')
)

if (!data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Could not load Go QR documents',
  })
}

const documents = computed(() => data.value?.documents || [])

async function deleteDocument(document: PublicGoQrRecord) {
  if (!isAdmin.value || deletingSlug.value) return
  if (!window.confirm(`Delete ${document.slug}?`)) return

  deletingSlug.value = document.slug
  deleteError.value = ''

  try {
    const token = await currentUser.value?.getIdToken()
    await $fetch(`/api/docs/${encodeURIComponent(document.slug)}`, {
      method: 'DELETE',
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
    await refresh()
  } catch (error) {
    deleteError.value =
      error instanceof Error ? error.message : 'Could not delete document.'
  } finally {
    deletingSlug.value = ''
  }
}

useSeoMeta({
  title: 'Documents · Go QR',
  description: 'Public Go QR document index.',
  robots: 'noindex, nofollow',
})
</script>
