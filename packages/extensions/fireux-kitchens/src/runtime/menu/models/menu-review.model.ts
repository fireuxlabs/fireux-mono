type KitchenMenuReviewIdentity = {
  revision: string
  name: string
  description: string
  kitchenSlug: string
  menuSlug: string
}

export type KitchenMenuReview = KitchenMenuReviewIdentity &
  (
    | {
        format: 'document'
        document: { url: string; name: string; type: string }
      }
    | {
        format: 'interactive'
        currency: string
        sections: Array<{
          id: string
          label: string
          items: Array<{
            id: string
            name: string
            description: string
            price: number
            options: Array<{ label: string; price: number }>
          }>
        }>
      }
  )
