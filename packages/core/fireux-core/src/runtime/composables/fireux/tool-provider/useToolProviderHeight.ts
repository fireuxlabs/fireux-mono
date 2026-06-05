import { nextTick, onBeforeUnmount, onMounted, type Ref } from 'vue'
import type { ToolProviderHeightMessage } from '../../../types/tool-provider.types'

export function useToolProviderHeight<
  ProviderId extends string,
  ToolId extends string,
>(input: {
  provider: ProviderId
  root: Ref<HTMLElement | null>
  tool: ToolId
}) {
  let resizeObserver: ResizeObserver | null = null

  function postToolHeight() {
    const height = Math.ceil(
      input.root.value?.scrollHeight || document.documentElement.scrollHeight
    )
    const message = {
      source: input.provider,
      tool: input.tool,
      type: 'tool-height',
      height,
    } satisfies ToolProviderHeightMessage<ProviderId, ToolId>

    window.parent?.postMessage(message, '*')
  }

  onMounted(async () => {
    await nextTick()
    postToolHeight()

    if (!input.root.value) return
    resizeObserver = new ResizeObserver(postToolHeight)
    resizeObserver.observe(input.root.value)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  return {
    postToolHeight,
  }
}
