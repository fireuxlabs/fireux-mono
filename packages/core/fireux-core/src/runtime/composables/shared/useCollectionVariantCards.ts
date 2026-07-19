// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: share pill/cell mapping mechanics only.
import { computed, type ComputedRef, type Ref } from 'vue'

type CollectionItems<TRaw> =
  | Ref<TRaw[] | undefined>
  | ComputedRef<TRaw[] | undefined>

type CollectionVariant = Ref<'pill' | 'cell'> | ComputedRef<'pill' | 'cell'>

type CardFactory<TRaw, TCard extends object> = (
  item: TRaw
) => TCard | null | undefined

export type UseCollectionVariantCardsOptions<
  TRaw,
  TCard extends object,
  TCell extends object,
> = {
  items: CollectionItems<TRaw>
  variant: CollectionVariant
  makeCard: CardFactory<TRaw, TCard>
  makePill: CardFactory<TRaw, TCard>
  makeCell: CardFactory<TRaw, TCell>
}

/**
 * Resolve the repeated two-variant card handoff used by named collection
 * managers. Data authority, searching, state copy, and rendering stay local.
 */
export function useCollectionVariantCards<
  TRaw,
  TCard extends object,
  TCell extends object,
>(options: UseCollectionVariantCardsOptions<TRaw, TCard, TCell>) {
  const cards = computed<TCard[]>(() =>
    (options.items.value ?? [])
      .map((item) => {
        if (options.variant.value === 'cell') {
          const base = options.makeCard(item)
          const cell = options.makeCell(item)
          if (!base || !cell) return null
          return { ...base, ...cell }
        }

        return options.makePill(item) ?? null
      })
      .filter((card): card is TCard => Boolean(card))
  )

  return { cards }
}
