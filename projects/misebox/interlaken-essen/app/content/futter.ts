export type FutterPost = {
  id: string
  title: string
  body: string
  image: string
  imageAlt: string
  label: string
}

export const futterPosts: FutterPost[] = [
  {
    id: 'wo-sind-die-chuehlschraenke',
    title: 'Wo steit dis Lieblings-Chüelschrank?',
    body: 'Hilf üs, üsi lokali Charte z mache. Wo holsch du Milch, Anke oder Honig?',
    image: '/img/app/social-wo-fridges-swiss.png',
    imageAlt:
      'Illustrieri Charte vo Interlake mit dr Frag Wo? und de Wörter Milch, Anke und Honig.',
    label: 'Us dr Region',
  },
]
