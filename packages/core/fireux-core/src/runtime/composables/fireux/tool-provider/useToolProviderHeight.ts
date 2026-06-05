import { nextTick, onBeforeUnmount, onMounted, type Ref } from 'vue'
import type {
  ToolProviderHeightMessage,
  ToolProviderHeightRequestMessage,
} from '../../../types/tool-provider.types'

export function useToolProviderHeight<
  ProviderId extends string,
  ToolId extends string,
>(input: {
  provider: ProviderId
  root: Ref<HTMLElement | null>
  tool: ToolId
}) {
  let resizeObserver: ResizeObserver | null = null
  let animationFrame = 0
  let targetOrigin = '*'

  function postToolHeight() {
    const root = input.root.value
    const height = Math.ceil(
      root
        ? Math.max(root.scrollHeight, root.getBoundingClientRect().height)
        : document.body.scrollHeight
    )
    const message = {
      source: input.provider,
      tool: input.tool,
      type: 'tool-height',
      height,
    } satisfies ToolProviderHeightMessage<ProviderId, ToolId>

    window.parent?.postMessage(message, targetOrigin)
  }

  function scheduleToolHeight() {
    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = requestAnimationFrame(() => {
      animationFrame = 0
      postToolHeight()
    })
  }

  function handleToolHeightRequest(event: MessageEvent) {
    if (event.source !== window.parent) return

    const data = event.data as Partial<ToolProviderHeightRequestMessage>
    if (data?.source !== 'fireux-tool-iframe') return
    if (data?.type !== 'tool-height-request') return

    targetOrigin = event.origin
    scheduleToolHeight()
  }

  onMounted(async () => {
    await nextTick()
    scheduleToolHeight()

    if (!input.root.value) return
    resizeObserver = new ResizeObserver(scheduleToolHeight)
    resizeObserver.observe(input.root.value)
    resizeObserver.observe(document.body)
    window.addEventListener('message', handleToolHeightRequest)
    window.addEventListener('resize', scheduleToolHeight)
  })

  onBeforeUnmount(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame)
    resizeObserver?.disconnect()
    resizeObserver = null
    window.removeEventListener('message', handleToolHeightRequest)
    window.removeEventListener('resize', scheduleToolHeight)
  })

  return {
    postToolHeight,
    scheduleToolHeight,
  }
}
