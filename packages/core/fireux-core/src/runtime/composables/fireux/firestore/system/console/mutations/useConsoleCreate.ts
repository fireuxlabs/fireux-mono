/**
 * Shared Console creation transport types.
 *
 * Domain extensions own root validation, creation and App-support attachment.
 * Core deliberately carries no registry of extension entity families.
 */
export type ConsoleCreateMode = 'public' | 'console'

export type ConsoleCreateResult = {
  id: string
  createdRoot: boolean
  createdAppSupport: boolean
}

export type ConsoleRootCreateResult = {
  id: string
  created: boolean
}
