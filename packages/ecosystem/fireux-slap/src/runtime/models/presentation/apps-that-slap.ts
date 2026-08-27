export const appsThatSlapSceneLayerOrder = [
  'background',
  'content',
  'foreground',
] as const

export type AppsThatSlapSceneLayer =
  (typeof appsThatSlapSceneLayerOrder)[number]

export interface AppsThatSlapElement {
  id: string
}

export interface AppsThatSlapScene<
  Element extends AppsThatSlapElement = AppsThatSlapElement,
> {
  id: string
  background?: readonly Element[]
  content: readonly Element[]
  foreground?: readonly Element[]
}

export interface AppsThatSlapPage<
  Scene extends AppsThatSlapScene = AppsThatSlapScene,
> {
  scenes: readonly Scene[]
}

export function defineAppsThatSlapPage<
  const Page extends AppsThatSlapPage,
>(page: Page): Page {
  return page
}
