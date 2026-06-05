import type { ToolProviderToolContract } from 'fireux-core/runtime/types/tool-provider.types'

export type GoQrToolId = 'doc' | 'text' | 'url'

export type GoQrToolContract = ToolProviderToolContract<GoQrToolId, 'go-qr'>
