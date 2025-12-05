declare module '@nuxt/content/config' {
  type MarkdownPlugin = unknown

  interface MarkdownConfig {
    remarkPlugins?: MarkdownPlugin[]
    rehypePlugins?: MarkdownPlugin[]
    [key: string]: unknown
  }

  interface ContentSource {
    markdown?: MarkdownConfig
    sources?: Record<string, unknown>
    [key: string]: unknown
  }

  interface ContentConfig {
    content?: ContentSource
    experimental?: Record<string, unknown>
    extends?: unknown
    [key: string]: unknown
  }

  export function defineContentConfig<T extends ContentConfig>(config: T): T
}
