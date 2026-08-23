import type {
  WasteAIContext,
  WasteAIHandshake,
} from '../../models/waste-ai'

/** First WasteAI handshake. It echoes context but does not reason or act. */
export function helloFromWasteAI(context: WasteAIContext): WasteAIHandshake {
  return {
    agent: 'WasteAI',
    message: 'Hello from WasteAI.',
    context,
  }
}
