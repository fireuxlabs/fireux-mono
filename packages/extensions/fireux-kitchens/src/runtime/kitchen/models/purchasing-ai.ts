export type PurchasingAIHello = {
  agent: 'PurchasingAI'
  message: 'Hello from PurchasingAI.'
}

const purchasingPrompt = /\bpurchas(?:e|ing)(?:\s*ai)?\b/i

export function isPurchasingAIHelloPrompt(prompt: string): boolean {
  return purchasingPrompt.test(prompt)
}
