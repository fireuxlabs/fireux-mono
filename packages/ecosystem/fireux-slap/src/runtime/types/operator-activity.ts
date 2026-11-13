/** Public catalogue projection supplied by each App; never a booking record. */
export interface OperatorActivity {
  id: string
  name: string
  category: string
  description: string
  facts: { label: string; value: string }[]
  requirements: string[]
  price: string
  reviewNeeded: boolean
  source: string
  publicTo: string
}
