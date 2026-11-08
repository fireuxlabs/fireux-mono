export type CoreInventoryEntry = {
  id: string
  name: string
  source: string
  scope: string
  group: string
  registered: boolean
  preview: boolean
  code: string
}
export function coreInventory(
  runtimeRoot: string,
  components?: { filePath: string; pascalName: string }[],
  previewSource?: string
): CoreInventoryEntry[]

export function publicLibrary(
  runtimeRoot: string,
  components?: { filePath: string; pascalName: string }[],
  previewSource?: string
): (CoreInventoryEntry & { description: string })[]
