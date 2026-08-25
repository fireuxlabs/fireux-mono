export type KitchenAICreatedObject = {
  name: string
  kind: string
  to: string
  imageUrl?: string
  actionLabel?: string
}

export type KitchenAIResultAction = {
  kind: 'copy'
  label: string
  value: string
}

export type KitchenAIStarter = {
  label: string
  prompt: string
  icon: string
}

export type KitchenAIToolNugget = {
  id: string
  label: string
  prompt: string
  icon: string
}

export type KitchenCapabilityActionTarget = {
  actionId: string
  targetId: string
  label: string
}

export type KitchenAIWelcomeMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string
  createdObject?: KitchenAICreatedObject
  resultAction?: KitchenAIResultAction
}
