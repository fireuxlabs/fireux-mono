import { setResponseHeaders, type H3Event } from 'h3'
import type { ToolProviderToolContract } from '../../types/tool-provider.types'

type ToolProviderHeaderOptions = {
  methods?: string
  requestHeaders?: string
}

type ToolProviderToolMap<ProviderId extends string> = Record<
  string,
  ToolProviderToolContract<string, ProviderId>
>

const defaultMethods = 'GET,POST,OPTIONS'
const defaultRequestHeaders = 'Content-Type,Authorization'

export function setToolProviderResponseHeaders(
  event: H3Event,
  options: ToolProviderHeaderOptions = {}
) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': options.methods || defaultMethods,
    'Access-Control-Allow-Headers':
      options.requestHeaders || defaultRequestHeaders,
  })
}

export function toolProviderResponse<Tool extends ToolProviderToolContract>(
  event: H3Event,
  tool: Tool,
  options: ToolProviderHeaderOptions = {}
) {
  setToolProviderResponseHeaders(event, options)

  return {
    ok: true,
    tool,
  }
}

export function defineToolProviderRegistry<
  ProviderId extends string,
  const Tools extends ToolProviderToolMap<ProviderId>,
>(input: { provider: ProviderId; tools: Tools }) {
  type ToolId = keyof Tools & string

  return {
    provider: input.provider,
    tools: input.tools,
    list() {
      return Object.values(input.tools) as Tools[ToolId][]
    },
    tool<Tool extends ToolId>(id: Tool) {
      return input.tools[id]
    },
    toolResponse<Tool extends ToolId>(
      event: H3Event,
      id: Tool,
      options: ToolProviderHeaderOptions = {}
    ) {
      const tool = input.tools[id]
      if (!tool) throw new Error(`Unknown provider tool: ${id}`)
      return toolProviderResponse(event, tool, options)
    },
  }
}
