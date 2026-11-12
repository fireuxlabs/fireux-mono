/** Shared transport envelopes; domains own the records and projections inside them. */
export type CollectionResponse<T> = {
  ok: true
  count: number
  generatedAt: string
  items: T[]
}

export type DetailResponse<T> = {
  ok: true
  generatedAt: string
  item: T
}

/** A page of records; transport metadata does not create another Entity model. */
export type CollectionPage<T> = {
  ok: true
  items: T[]
  nextCursor: string | null
}
