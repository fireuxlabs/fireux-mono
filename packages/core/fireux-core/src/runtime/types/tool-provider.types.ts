export type ToolProviderToolContract<
  ToolId extends string = string,
  ProviderId extends string = string,
> = {
  id: ToolId
  provider: ProviderId
  messageSource: ProviderId
  title: string
  description: string
  message?: string
  endpoints?: Record<string, string>
  preview?: {
    base_url: string
    path_suffix: string
  }
  inputs?: readonly string[]
  outputs?: readonly string[]
}

export type ToolProviderHeightMessage<
  ProviderId extends string = string,
  ToolId extends string = string,
> = {
  source: ProviderId
  tool: ToolId
  type: 'tool-height'
  height: number
}
