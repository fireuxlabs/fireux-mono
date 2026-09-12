import { AsyncLocalStorage } from 'node:async_hooks'

export type LiveResponseSink = {
  push: (message: { data: string; event?: string }) => Promise<void>
  onClosed: (callback: () => void) => void
  close: () => Promise<void>
  send: () => null
}

export const liveResponseSink = new AsyncLocalStorage<LiveResponseSink>()
