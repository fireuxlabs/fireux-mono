export type MiseboxSolutionInstruction = {
  title: string
  icon: string
  body: string
}

export type MiseboxSolutionIntegration = {
  name: string
  icon: string
  body: string
  cta?: string
  to?: string
  external?: boolean
}

export type MiseboxSolutionEndpoint = {
  method: string
  path: string
  description: string
}

export type MiseboxSolution = {
  title: string
  description: string
  instructions: MiseboxSolutionInstruction[]
  integrations: {
    body: string
    items: MiseboxSolutionIntegration[]
  }
  upgrades: string[]
  dev: {
    endpoints: MiseboxSolutionEndpoint[]
  }
  seo: {
    title: string
    ogTitle: string
    twitterTitle: string
    description: string
    ogDescription: string
    twitterDescription: string
  }
}
