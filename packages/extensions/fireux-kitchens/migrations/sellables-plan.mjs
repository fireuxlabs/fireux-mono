import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

/** Offline only. Explicit placement paths are identity; names/prices never merge records. */
export function planSellableAdoption(input) {
  if (
    !input ||
    typeof input.kitchenId !== 'string' ||
    !/^[A-Za-z0-9_-]+$/.test(input.kitchenId) ||
    !Array.isArray(input.placements)
  )
    throw new Error('An exact Kitchen and placement export are required.')
  const prefix = `kitchens/${input.kitchenId}/menus/`
  const seen = new Set()
  return input.placements.map(({ path, data, updateTime }) => {
    const segments = typeof path === 'string' ? path.split('/') : []
    if (
      !path?.startsWith(prefix) ||
      segments.length !== 8 ||
      segments[4] !== 'sections' ||
      segments[6] !== 'items' ||
      seen.has(path) ||
      !data ||
      !updateTime
    )
      throw new Error('Invalid, duplicate or unversioned placement.')
    seen.add(path)
    if (data.sellable_id)
      return { path, action: 'already-bound', sellableId: data.sellable_id }
    const digest = createHash('sha256').update(path).digest('hex')
    return {
      path,
      action: 'review-adoption',
      sellableId: `placement-${digest}`,
      expectedUpdateTime: updateTime,
      preimageSha256: createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex'),
      dishId: data.dish_id,
      variants: (data.price_options?.length
        ? data.price_options
        : [
            {
              label: 'Default',
              quantity: 1,
              unit: '',
              price: data.price,
              implicit: true,
            },
          ]
      ).map((option, index) => ({
        ...option,
        id: `placement-${digest}-${index + 1}`,
      })),
      addOns: data.add_ons || [],
      note: 'No apply operation. Review exact identity, currency, terms, backup and rollback before live cutover.',
    }
  })
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (process.argv.length !== 3)
    throw new Error(
      'Usage: node sellables-plan.mjs protected-placement-export.json'
    )
  console.log(
    JSON.stringify(
      planSellableAdoption(JSON.parse(await readFile(process.argv[2], 'utf8'))),
      null,
      2
    )
  )
}
