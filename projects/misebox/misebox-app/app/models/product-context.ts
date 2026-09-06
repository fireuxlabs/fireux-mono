export type MiseboxProductContext = {
  title: string
  summary: string
  source: string
  reviewStatus: 'draft' | 'reviewed'
}
export type MiseboxProductContextResponse = {
  appId: string
  contextId: 'product'
  sourcePath: string
  revision: string
  context: MiseboxProductContext
}
