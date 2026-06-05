import type { ToolProviderToolContract } from 'fireux-core/runtime/types/tool-provider.types'

export type SproochliToolId = 'menu'

export type SproochliToolContract = ToolProviderToolContract<
  SproochliToolId,
  'sproochli'
>
