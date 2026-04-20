export type DemoKitchenListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

const demoKitchens: DemoKitchenListItem[] = [
  {
    id: 'line-pass-lab',
    name: 'Line Pass Lab',
    label: 'Fast-casual service simulation',
  },
  {
    id: 'prep-yard',
    name: 'Prep Yard',
    label: 'High-volume prep workflow demo',
  },
  {
    id: 'garden-room',
    name: 'Garden Room',
    label: 'Neighbourhood kitchen dinner service',
  },
]

export const getDemoKitchens = (): DemoKitchenListItem[] => demoKitchens.slice()
