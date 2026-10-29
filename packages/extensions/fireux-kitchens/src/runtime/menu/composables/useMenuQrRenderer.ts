import { ref, nextTick, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import type QRCodeStyling from 'qr-code-styling'
import type { Options as QRCodeStylingOptions } from 'qr-code-styling'
import type { MenuLoadFailure } from './useMenu'

export function useMenuQrRenderer(
  menuUrl: Ref<string>,
  qrFailure: Ref<MenuLoadFailure | null>,
  pending: Ref<boolean>,
  presentation: { size?: number; margin?: number } = {}
) {
  const qrContainer = ref<HTMLElement | null>(null)
  const qrReady = ref(false)
  const qrError = ref(false)
  const qrDownloadUrl = ref('')
  let qrGeneration = 0
  let currentQr: Pick<
    QRCodeStyling,
    'append' | 'update' | 'getRawData'
  > | null = null
  type QrWatchState = readonly [string, MenuLoadFailure | null, boolean]
  onMounted(() => generateQr(menuUrl.value))
  onBeforeUnmount(() => {
    qrGeneration += 1
    currentQr = null
    qrReady.value = false
    qrDownloadUrl.value = ''
  })
  watch(
    () => [menuUrl.value, qrFailure.value, pending.value] as const,
    ([url, menuFailure, isPending]: QrWatchState) => {
      if (isPending || menuFailure) {
        qrGeneration += 1
        qrReady.value = false
        qrDownloadUrl.value = ''
        qrError.value = false
        return
      }

      generateQr(url)
    }
  )

  async function generateQr(url: string) {
    const generation = ++qrGeneration
    qrReady.value = false
    qrDownloadUrl.value = ''
    qrError.value = false

    if (!url || qrFailure.value) return

    try {
      await nextTick()
      if (!qrContainer.value || generation !== qrGeneration) return

      const options = qrOptions(url)
      if (currentQr) {
        currentQr.update(options)
      } else {
        const QRCodeStyling = (await import('qr-code-styling')).default
        if (generation !== qrGeneration || !qrContainer.value) return
        currentQr = new QRCodeStyling(options)
        qrContainer.value.replaceChildren()
        currentQr.append(qrContainer.value)
      }

      // The library finishes SVG rendering asynchronously. The displayed and
      // downloaded code must both belong to this same settled destination.
      const file = await currentQr.getRawData('svg')
      if (generation !== qrGeneration) return
      if (!(file instanceof Blob)) throw new Error('QR SVG is unavailable.')
      const svg = await file.text()
      if (generation !== qrGeneration) return
      qrDownloadUrl.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      qrReady.value = true
    } catch {
      if (generation === qrGeneration) qrError.value = true
    }
  }

  function qrOptions(data: string): Partial<QRCodeStylingOptions> {
    return {
      width: presentation.size ?? 1024,
      height: presentation.size ?? 1024,
      type: 'svg',
      data,
      margin: presentation.margin ?? 28,
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
      dotsOptions: {
        color: '#111827',
        type: 'rounded',
        roundSize: true,
      },
      cornersSquareOptions: {
        color: '#111827',
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: '#111827',
        type: 'dot',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
    }
  }

  return { qrContainer, qrReady, qrError, qrDownloadUrl }
}
