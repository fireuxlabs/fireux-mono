import type { ToolProviderToolContract } from 'fireux-core/runtime/types/tool-provider.types'

export type MiseboxToolId = 'ordering'

export type MiseboxToolContract = ToolProviderToolContract<
  MiseboxToolId,
  'misebox'
>
