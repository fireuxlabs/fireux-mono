import type { PurchasingAIHello } from '../../models/purchasing-ai'

/** First PurchasingAI handshake. It reads nothing and performs no action. */
export function helloFromPurchasingAI(): PurchasingAIHello {
  return {
    agent: 'PurchasingAI',
    message: 'Hello from PurchasingAI.',
  }
}
