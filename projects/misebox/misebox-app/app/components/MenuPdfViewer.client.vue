<template>
  <div class="min-h-full bg-white">
    <div
      v-if="loading"
      class="grid h-[calc(100vh-3.5rem)] place-items-center text-sm text-muted"
    >
      Loading menu...
    </div>

    <UAlert
      v-else-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Could not load menu"
      :description="errorMessage"
      class="m-4"
    />

    <div
      ref="pagesHost"
      v-show="!loading && !errorMessage"
      class="min-h-full"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'

const props = defineProps<{
  url: string
  title: string
}>()

const pagesHost = ref<HTMLElement | null>(null)
const loading = ref(true)
const errorMessage = ref('')
let renderRun = 0

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

onMounted(() => {
  loadPdf()
  window.addEventListener('resize', queueResizeRender)
})

onBeforeUnmount(() => {
  renderRun++
  window.removeEventListener('resize', queueResizeRender)
})

watch(() => props.url, () => loadPdf())

let resizeTimer: ReturnType<typeof setTimeout> | undefined
function queueResizeRender() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(loadPdf, 200)
}

function clearHost() {
  if (!pagesHost.value) return
  pagesHost.value.replaceChildren()
}

async function loadPdf() {
  const currentRun = ++renderRun
  loading.value = true
  errorMessage.value = ''
  clearHost()

  try {
    const pdfDocument = await pdfjs.getDocument({ url: props.url }).promise

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      if (currentRun !== renderRun) return

      const page = await pdfDocument.getPage(pageNumber)
      const baseViewport = page.getViewport({ scale: 1 })
      const maxWidth = Math.max(320, (pagesHost.value?.clientWidth || window.innerWidth) - 24)
      const scale = Math.min(maxWidth / baseViewport.width, 2)
      const viewport = page.getViewport({ scale })
      const canvas = documentCanvas(viewport.width, viewport.height)
      const context = canvas.getContext('2d')

      if (!context || !pagesHost.value) return

      pagesHost.value.appendChild(canvas)
      await page.render({ canvas, canvasContext: context, viewport }).promise
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Please open the original file.'
  } finally {
    if (currentRun === renderRun) loading.value = false
  }
}

function documentCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width)
  canvas.height = Math.ceil(height)
  canvas.setAttribute('aria-label', props.title)
  canvas.className = 'mx-auto my-3 block max-w-full bg-white shadow-sm'
  return canvas
}
</script>
