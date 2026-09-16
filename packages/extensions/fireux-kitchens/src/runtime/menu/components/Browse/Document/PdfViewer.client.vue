<template>
  <div ref="viewerHost" class="menu-document-pdf" :aria-busy="rendering">
    <p v-if="loading" class="menu-document-pdf__state" role="status">
      Loading menu document…
    </p>

    <p v-else-if="previewFailed" class="menu-document-pdf__state" role="alert">
      PDF preview unavailable. Use Open original instead.
    </p>

    <div
      ref="pagesHost"
      v-show="!loading && !previewFailed"
      class="menu-document-pdf__pages"
      role="group"
      :aria-label="`${title} pages`"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'

const props = defineProps<{
  url: string
  title: string
}>()

const viewerHost = ref<HTMLElement | null>(null)
const pagesHost = ref<HTMLElement | null>(null)
const loading = ref(true)
const rendering = ref(true)
const previewFailed = ref(false)
let renderRun = 0
let resizeTimer: ReturnType<typeof setTimeout> | undefined
let resizeObserver: ResizeObserver | undefined
let renderedWidth = 0

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

onMounted(async () => {
  await nextTick()
  renderedWidth = viewerHost.value?.clientWidth || 0
  loadPdf()
  resizeObserver = new ResizeObserver(queueResizeRender)
  if (viewerHost.value) resizeObserver.observe(viewerHost.value)
})

onBeforeUnmount(() => {
  renderRun += 1
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeObserver?.disconnect()
  resizeObserver = undefined
})

watch(
  () => props.url,
  () => {
    renderedWidth = 0
    clearHost()
    loadPdf()
  }
)

function queueResizeRender() {
  const width = viewerHost.value?.clientWidth || 0
  if (!width || Math.abs(width - renderedWidth) < 1) return
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(loadPdf, 200)
}

function clearHost() {
  pagesHost.value?.replaceChildren()
}

async function loadPdf() {
  const currentRun = ++renderRun
  const url = String(props.url || '').trim()
  const keepExistingPages = Boolean(pagesHost.value?.childElementCount)
  const renderedPages: HTMLCanvasElement[] = []

  loading.value = !keepExistingPages
  rendering.value = true
  previewFailed.value = false

  if (!url) {
    clearHost()
    previewFailed.value = true
    loading.value = false
    rendering.value = false
    return
  }

  try {
    const pdfDocument = await pdfjs.getDocument({ url }).promise
    try {
      for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber++
      ) {
        if (currentRun !== renderRun) return

        const page = await pdfDocument.getPage(pageNumber)
        const baseViewport = page.getViewport({ scale: 1 })
        const hostWidth = viewerHost.value?.clientWidth || window.innerWidth
        const availableWidth = Math.max(
          1,
          Math.min(hostWidth, window.innerWidth) - 24
        )
        const scale = Math.min(availableWidth / baseViewport.width, 2)
        const viewport = page.getViewport({ scale })
        const outputScale = Math.min(window.devicePixelRatio || 1, 2)
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (!context) return

        canvas.width = Math.ceil(viewport.width * outputScale)
        canvas.height = Math.ceil(viewport.height * outputScale)
        canvas.style.width = `${Math.ceil(viewport.width)}px`
        canvas.setAttribute(
          'aria-label',
          `${props.title}, page ${pageNumber} of ${pdfDocument.numPages}`
        )
        canvas.setAttribute('role', 'img')
        canvas.className = 'menu-document-pdf__page'
        renderedPages.push(canvas)

        await page.render({
          canvas,
          canvasContext: context,
          transform:
            outputScale === 1
              ? undefined
              : [outputScale, 0, 0, outputScale, 0, 0],
          viewport,
        }).promise
      }

      if (currentRun !== renderRun) return
      const host = pagesHost.value
      if (!host) return
      host.replaceChildren(...renderedPages)
      renderedWidth = viewerHost.value?.clientWidth || renderedWidth
    } finally {
      await pdfDocument.destroy()
    }
  } catch {
    if (currentRun === renderRun) previewFailed.value = !keepExistingPages
  } finally {
    if (currentRun === renderRun) {
      loading.value = false
      rendering.value = false
    }
  }
}
</script>

<style scoped>
.menu-document-pdf {
  min-width: 0;
  overflow: hidden;
  border-radius: var(--menu-radius);
  background: #fff;
}

.menu-document-pdf__state {
  display: grid;
  min-height: 14rem;
  place-items: center;
  margin: 0;
  padding: calc(var(--spacing) * 8);
  color: #475569;
  font-size: 0.9rem;
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.menu-document-pdf__pages {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3);
}

.menu-document-pdf__pages :deep(.menu-document-pdf__page) {
  display: block;
  height: auto;
  max-width: 100%;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 0.35rem 1.5rem rgb(15 23 42 / 0.16);
}
</style>
