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
    image_url:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=640&h=520&q=80',
  },
  {
    id: 'prep-yard',
    name: 'Prep Yard',
    label: 'High-volume prep workflow demo',
    image_url:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=640&h=520&q=80',
  },
  {
    id: 'garden-room',
    name: 'Garden Room',
    label: 'Neighbourhood kitchen dinner service',
    image_url:
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=640&h=520&q=80',
  },
]

export const getDemoKitchens = (): DemoKitchenListItem[] => demoKitchens.slice()
