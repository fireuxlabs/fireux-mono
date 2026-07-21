// @fireux-script
// last_used: 2026-07-21
// usage_note: build confidence-scored Interlaken Pizza Dish and MenuItem comparisons for the read-only audit.
// Concurrent edit — 2026-07-21 23:39 CEST — Interlaken Pizza audit split: isolate catalogue matching and proposed-change analysis.

const ARABIC_PARENTHETICAL = /\([^)]*[\u0600-\u06ff][^)]*\)/gu
const ARABIC_TEXT = /[\u0600-\u06ff]+/gu

const TOKEN_ALIASES = new Map([
  ['chardonay', 'chardonnay'],
  ['covered', 'zugedeckt'],
  ['cippola', 'cipolla'],
  ['fattusch', 'fattoush'],
  ['feldschlossen', 'feldschlosschen'],
  ['giner', 'ginger'],
  ['burgers', 'burger'],
  ['doener', 'doner'],
  ['doner', 'doner'],
  ['gyross', 'gyros'],
  ['kebabs', 'kebab'],
  ['kingfischer', 'kingfisher'],
  ['nuggets', 'nugget'],
  ['ovolmaltine', 'ovomaltine'],
  ['plate', 'teller'],
  ['plates', 'teller'],
  ['pizzas', 'pizza'],
  ['sauces', 'sauce'],
  ['salmone', 'salmon'],
  ['salam', 'salami'],
  ['shawrama', 'schawarma'],
  ['spicy', 'hot'],
  ['qualfrisch', 'quollfrisch'],
  ['wraps', 'wrap'],
  ['wrq', 'warak'],
])

const PHRASE_ALIASES = new Map([
  ['ballantine s', 'ballantines'],
  ['eggs spinach', 'eier spinat'],
  ['field castle', 'feldschlosschen beer'],
  ['french fries', 'pommes frites'],
  ['full medames', 'ful medames'],
  ['ice tea rivella giner ale', 'ice tea rivella ginger ale'],
  ['jack daniel s', 'jack daniels'],
  ['lamb chop', 'lamm kotelett'],
  ['lamb chop teller', 'lamm kotelett'],
  ['lentil soup', 'linsensuppe'],
  ['mineral water sparking water', 'mineral water sparkling water'],
  ['pizza special', 'pizza speziale'],
  ['pizza spicy salam peperoni', 'pizza spicy salami peperoni'],
  ['rugen brau beer', 'rugenbrau beer'],
  ['rugenbrau dose', 'rugenbrau beer'],
  ['sambusak 5 pieces', 'sambusak'],
  ['spaghetti bolognese beef', 'spaghetti bolognese'],
  ['spaghetti poulet checken', 'spaghetti poulet'],
  ['tea sorten', 'tee sorten'],
  ['turkish tea powder 1 person', 'turkish tea kanne'],
  ['turkish tea powder 2 person', 'turkish tea kanne'],
])

export function buildInterlakenAudit({ dishes, menuItems, source }) {
  const itemsByDishId = new Map()
  for (const item of menuItems) {
    if (!itemsByDishId.has(item.dishId)) itemsByDishId.set(item.dishId, [])
    itemsByDishId.get(item.dishId).push(item)
  }

  const currentDishes = dishes.map((dish) => ({
    ...dish,
    normalizedName: normalizeProductName(dish.name),
    aliasName: aliasProductName(dish.name),
    menuItems: itemsByDishId.get(dish.id) || [],
  }))
  const websiteProducts = source.products.map((product) => ({
    ...product,
    normalizedName: normalizeProductName(product.websiteName),
    aliasName: aliasProductName(product.websiteName),
    itemKind: inferItemKind(product),
  }))

  classifyWebsiteProducts(websiteProducts)

  const auditedProducts = websiteProducts.map((product) => {
    const match = matchWebsiteProduct(product, currentDishes)
    const currentDish = match.dishId
      ? currentDishes.find((dish) => dish.id === match.dishId) || null
      : null
    const manualReasons = [
      ...(match.manualReason ? [match.manualReason] : []),
      ...(product.sourceConflicts.length
        ? ['The same website product ID has conflicting category placements.']
        : []),
    ]
    const accepted = ['exact', 'probable'].includes(match.status)
    const websiteDescription = cleanWebsiteDescription(product.description)
    const proposedChanges = []

    if (accepted && currentDish) {
      if (!currentDish.description && websiteDescription) {
        proposedChanges.push({
          field: 'Dish.description',
          action: 'fill_missing_only',
          currentValue: '',
          proposedValue: websiteDescription,
        })
      } else if (
        websiteDescription &&
        currentDish.description &&
        normalizeCopy(currentDish.description) !==
          normalizeCopy(websiteDescription)
      ) {
        proposedChanges.push({
          field: 'Dish.description',
          action: 'preserve_existing_manual_review',
          currentValue: currentDish.description,
          proposedValue: websiteDescription,
        })
      }

      if (product.imageUrl) {
        proposedChanges.push({
          field: 'Dish.image_url',
          action: currentDish.imageUrl
            ? 'preserve_existing_unless_explicit_overwrite'
            : 'stage_local_then_upload_later',
          currentValue: currentDish.imageUrl || '',
          sourceUrl: product.imageUrl,
        })
      }

      if (currentDish.menuItems.length === 1) {
        const currentMenuItem = currentDish.menuItems[0]
        if (
          Number.isFinite(product.price) &&
          product.price > 0 &&
          currentMenuItem.price !== product.price
        ) {
          proposedChanges.push({
            field: 'MenuItem.price',
            action: 'preserve_existing_manual_review',
            menuItemId: currentMenuItem.id,
            sectionId: currentMenuItem.sectionId,
            currentValue: currentMenuItem.price,
            proposedValue: product.price,
          })
        }

        const sizeGroup = product.optionGroups.find((group) =>
          /\bsize\b/i.test(group.label)
        )
        if (sizeGroup) {
          const proposedOptions = optionGroupMapping(
            sizeGroup,
            product.price
          ).options
          const currentOptions = currentMenuItem.priceOptions.map((option) => ({
            label: option.label,
            price: option.price,
          }))
          if (!sameOptionRows(currentOptions, proposedOptions)) {
            proposedChanges.push({
              field: 'MenuItem.price_options',
              action: 'preserve_existing_manual_review',
              menuItemId: currentMenuItem.id,
              sectionId: currentMenuItem.sectionId,
              currentValue: currentOptions,
              proposedValue: proposedOptions,
              sourcePriceMode: 'delta',
              targetPriceMode: 'absolute',
            })
          }
        }
      } else if (currentDish.menuItems.length > 1) {
        proposedChanges.push({
          field: 'MenuItem',
          action: 'manual_target_selection_required',
          reason: 'The matched Dish appears in more than one current MenuItem.',
          menuItemIds: currentDish.menuItems.map((item) => item.id),
        })
      }
    }

    return {
      websiteProductId: product.websiteProductId,
      websiteName: product.websiteName,
      normalizedName: product.normalizedName,
      matchingName: product.aliasName,
      categories: product.categories.map((category) => ({
        id: category.id,
        name: category.name,
        parentId: category.parentId,
        parentName: category.parentName,
      })),
      price: product.price,
      description: websiteDescription,
      optionGroups: product.optionGroups.map((group) => ({
        ...group,
        proposedMapping: optionGroupMapping(group, product.price),
      })),
      productType: product.productType,
      itemKind: product.itemKind,
      websiteImageUrl: product.imageUrl,
      productUrl: product.productUrl,
      placementCount: product.placementCount,
      duplicateNameProductIds: product.duplicateNameProductIds,
      sourceConflicts: product.sourceConflicts,
      match,
      currentDish: currentDish
        ? {
            id: currentDish.id,
            name: currentDish.name,
            description: currentDish.description,
            itemKind: currentDish.itemKind,
            isDeal: currentDish.isDeal,
            imageUrl: currentDish.imageUrl,
            menuItems: currentDish.menuItems,
          }
        : null,
      alreadyExistsInFirestore: accepted
        ? true
        : match.status === 'missing'
          ? false
          : null,
      appearsMissingFromFirestore: match.status === 'missing',
      requiresManualReview:
        match.status === 'manual_review' || manualReasons.length > 0,
      manualReviewReasons: manualReasons,
      proposedChanges,
    }
  })

  downgradeDishCollisions(auditedProducts)

  const acceptedDishIds = new Set(
    auditedProducts
      .filter((product) => ['exact', 'probable'].includes(product.match.status))
      .map((product) => product.match.dishId)
  )
  const manualCandidateDishIds = new Set(
    auditedProducts
      .filter((product) => product.match.status === 'manual_review')
      .map((product) => product.match.dishId)
      .filter(Boolean)
  )
  const firestoreManualLinked = currentDishes
    .filter(
      (dish) =>
        !acceptedDishIds.has(dish.id) && manualCandidateDishIds.has(dish.id)
    )
    .map(firestoreDishSummary)
    .sort((left, right) => left.id.localeCompare(right.id))
  const firestoreOnly = currentDishes
    .filter(
      (dish) =>
        !acceptedDishIds.has(dish.id) && !manualCandidateDishIds.has(dish.id)
    )
    .map(firestoreDishSummary)
    .sort((left, right) => left.id.localeCompare(right.id))

  return {
    products: auditedProducts,
    firestoreOnly,
    firestoreManualLinked,
    duplicateWebsiteNames: duplicateWebsiteNames(auditedProducts),
    counts: countMatches(auditedProducts, firestoreOnly, firestoreManualLinked),
  }
}

function matchWebsiteProduct(product, dishes) {
  const candidates = dishes
    .map((dish) => scoreCandidate(product, dish))
    .sort(
      (left, right) =>
        right.score - left.score || left.dishId.localeCompare(right.dishId)
    )
  const best = candidates[0] || null
  const next = candidates[1] || null
  const margin = best ? best.score - (next?.score || 0) : 0
  const duplicateVariant = ['combo', 'deal', 'variation'].includes(
    product.productType
  )

  if (!best || best.score < 0.7) {
    return matchResult('missing', best, candidates, margin)
  }

  if (duplicateVariant) {
    return matchResult('manual_review', best, candidates, margin, {
      manualReason:
        product.productType === 'combo'
          ? 'Website combo shares or resembles a base Dish; it must not be merged automatically.'
          : product.productType === 'deal'
            ? 'Website deal requires an explicit Dish/deal decision and must not be merged automatically.'
            : 'Multiple website product IDs share this normalized name and require an operator decision.',
    })
  }

  if (best.itemKindMismatch) {
    return matchResult('manual_review', best, candidates, margin, {
      manualReason:
        'The website product kind conflicts with the current Dish kind.',
    })
  }

  if (best.exact && (!next || !next.exact)) {
    return matchResult('exact', best, candidates, margin)
  }

  if ((best.aliasExact || best.score >= 0.88) && margin >= 0.08) {
    return matchResult('probable', best, candidates, margin)
  }

  return matchResult('manual_review', best, candidates, margin, {
    manualReason:
      margin < 0.08
        ? 'The top candidate is not sufficiently separated from another Dish.'
        : 'The name similarity is not strong enough for an automatic match.',
  })
}

function matchResult(status, best, candidates, margin, extra = {}) {
  return {
    status,
    dishId: status === 'missing' ? '' : best?.dishId || '',
    dishName: status === 'missing' ? '' : best?.dishName || '',
    confidence: Number((best?.score || 0).toFixed(3)),
    margin: Number(margin.toFixed(3)),
    reasons: best?.reasons || [],
    alternatives: candidates.slice(0, 3).map((candidate) => ({
      dishId: candidate.dishId,
      dishName: candidate.dishName,
      confidence: Number(candidate.score.toFixed(3)),
    })),
    ...extra,
  }
}

function scoreCandidate(product, dish) {
  const exact = product.normalizedName === dish.normalizedName
  const aliasExact = !exact && product.aliasName === dish.aliasName
  const productTokens = product.aliasName.split(' ').filter(Boolean)
  const dishTokens = dish.aliasName.split(' ').filter(Boolean)
  const tokenScore = diceCoefficient(productTokens, dishTokens)
  const editScore = levenshteinSimilarity(product.aliasName, dish.aliasName)
  const componentMatch =
    productTokens.length > 0 &&
    dishTokens.length > productTokens.length &&
    productTokens.every((token) => dishTokens.includes(token))
  let score = exact
    ? 1
    : aliasExact
      ? 0.97
      : componentMatch
        ? 0.8
        : tokenScore * 0.64 + editScore * 0.36
  const reasons = []

  if (exact) reasons.push('normalized_name_exact')
  else if (aliasExact) reasons.push('alias_normalized_name_exact')
  else if (componentMatch)
    reasons.push('website_name_is_component_of_dish_name')
  else {
    reasons.push(`token_similarity:${tokenScore.toFixed(3)}`)
    reasons.push(`edit_similarity:${editScore.toFixed(3)}`)
  }

  const itemKindMismatch = Boolean(
    product.itemKind && dish.itemKind && product.itemKind !== dish.itemKind
  )
  if (itemKindMismatch) {
    score -= 0.14
    reasons.push('item_kind_mismatch')
  }

  return {
    dishId: dish.id,
    dishName: dish.name,
    exact,
    aliasExact,
    itemKindMismatch,
    reasons,
    score: Math.max(0, Math.min(1, score)),
  }
}

function classifyWebsiteProducts(products) {
  const groups = new Map()
  for (const product of products) {
    if (!groups.has(product.aliasName)) groups.set(product.aliasName, [])
    groups.get(product.aliasName).push(product)
  }

  for (const group of groups.values()) {
    const duplicateIds = group.map((product) => product.websiteProductId)
    const hasCombo = group.some((product) => comboSignal(product))

    for (const product of group) {
      product.duplicateNameProductIds = duplicateIds.filter(
        (productId) => productId !== product.websiteProductId
      )

      if (dealSignal(product)) product.productType = 'deal'
      else if (comboSignal(product)) product.productType = 'combo'
      else if (group.length === 1) product.productType = 'normal_product'
      else if (hasCombo) product.productType = 'normal_product'
      else product.productType = 'variation'
    }
  }
}

function comboSignal(product) {
  if (product.itemKind === 'drink') return false
  const text = [
    product.websiteName,
    product.description,
    product.imageUrl,
    ...product.categories.flatMap((category) => [
      category.parentName,
      category.name,
    ]),
  ]
    .join(' ')
    .toLowerCase()
  return /\b(combo|meal|drink|drinks|cola)\b/.test(text)
}

function dealSignal(product) {
  return product.categories.some((category) =>
    /\bdeal(?:s)?\b/i.test(`${category.parentName} ${category.name}`)
  )
}

function inferItemKind(product) {
  return product.categories.some((category) =>
    /\b(drinks?|beer|wine|spirits?)\b/i.test(
      `${category.parentName} ${category.name}`
    )
  )
    ? 'drink'
    : 'food'
}

export function normalizeProductName(value) {
  return normalizeName(value, false)
}

function aliasProductName(value) {
  return normalizeName(value, true)
}

function normalizeName(value, aliases) {
  let text = String(value ?? '')
    .replace(ARABIC_PARENTHETICAL, ' ')
    .replace(ARABIC_TEXT, ' ')
    .replace(/ß/g, 'ss')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`´]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!aliases) return text

  text = text
    .replace(/\bdoener\b/g, 'doner')
    .replace(/\b\d{1,2}(?:\s+\d{1,2})?\s*(?:vol)?\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const tokenNormalized = text
    .split(' ')
    .filter(Boolean)
    .map((token) => TOKEN_ALIASES.get(token) || token)
    .join(' ')

  return PHRASE_ALIASES.get(tokenNormalized) || tokenNormalized
}

function optionGroupMapping(group, basePrice) {
  if (/\bsize\b/i.test(group.label)) {
    return {
      status: 'candidate',
      field: 'MenuItem.price_options',
      priceMode: 'absolute',
      options: group.options.map((option) => ({
        label: option.label,
        price: Number(((basePrice || 0) + option.priceDelta).toFixed(2)),
      })),
    }
  }

  if (/burger extra|special combo/i.test(group.label)) {
    return {
      status: 'manual_review',
      field: 'MenuItem.add_ons',
      priceMode: 'incremental',
      reason:
        'Confirm that this website radio group is genuinely optional before mapping it as add-ons.',
      options: group.options.map((option) => ({
        label: option.label,
        price: option.priceDelta,
      })),
    }
  }

  return {
    status: 'manual_review',
    field: '',
    priceMode: 'website_delta',
    reason:
      'The current FireUX model cannot infer this option family safely from its label alone.',
  }
}

function sameOptionRows(left, right) {
  const normalize = (rows) =>
    rows.map((row) => ({
      label: String(row.label || '')
        .trim()
        .toLowerCase(),
      price: Number(Number(row.price || 0).toFixed(2)),
    }))
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
}

function duplicateWebsiteNames(products) {
  const groups = new Map()
  for (const product of products) {
    if (!groups.has(product.matchingName)) groups.set(product.matchingName, [])
    groups.get(product.matchingName).push(product)
  }

  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([normalizedName, group]) => ({
      normalizedName,
      products: group.map((product) => ({
        websiteProductId: product.websiteProductId,
        websiteName: product.websiteName,
        price: product.price,
        productType: product.productType,
        imageUrl: product.websiteImageUrl,
      })),
    }))
    .sort((left, right) =>
      left.normalizedName.localeCompare(right.normalizedName)
    )
}

function downgradeDishCollisions(products) {
  const acceptedByDishId = new Map()
  for (const product of products) {
    if (!['exact', 'probable'].includes(product.match.status)) continue
    if (!acceptedByDishId.has(product.match.dishId)) {
      acceptedByDishId.set(product.match.dishId, [])
    }
    acceptedByDishId.get(product.match.dishId).push(product)
  }

  for (const [dishId, collisions] of acceptedByDishId) {
    if (collisions.length < 2) continue
    const productIds = collisions.map((product) => product.websiteProductId)
    for (const product of collisions) {
      product.productType =
        product.productType === 'combo' ? product.productType : 'variation'
      product.match = {
        ...product.match,
        status: 'manual_review',
        manualReason: `Multiple website product IDs (${productIds.join(', ')}) resolve to Dish ${dishId}; none is auto-merged.`,
      }
      product.alreadyExistsInFirestore = null
      product.requiresManualReview = true
      product.manualReviewReasons = [
        ...product.manualReviewReasons,
        product.match.manualReason,
      ]
    }
  }
}

function countMatches(products, firestoreOnly, firestoreManualLinked) {
  const statusCount = (status) =>
    products.filter((product) => product.match.status === status).length

  return {
    exactMatches: statusCount('exact'),
    probableMatches: statusCount('probable'),
    manualReviewMatches: statusCount('manual_review'),
    websiteMissingInFirestore: statusCount('missing'),
    firestoreMissingOnWebsite: firestoreOnly.length,
    firestoreManualLinked: firestoreManualLinked.length,
  }
}

function firestoreDishSummary(dish) {
  return {
    id: dish.id,
    name: dish.name,
    normalizedName: dish.normalizedName,
    itemKind: dish.itemKind,
    isDeal: dish.isDeal,
    imageUrl: dish.imageUrl,
    menuItems: dish.menuItems,
  }
}

function diceCoefficient(leftTokens, rightTokens) {
  const left = new Set(leftTokens.filter(Boolean))
  const right = new Set(rightTokens.filter(Boolean))
  if (!left.size && !right.size) return 1
  if (!left.size || !right.size) return 0
  let intersection = 0
  for (const token of left) {
    if (right.has(token)) intersection += 1
  }
  return (2 * intersection) / (left.size + right.size)
}

function levenshteinSimilarity(left, right) {
  if (left === right) return 1
  if (!left.length || !right.length) return 0
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex]
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] +
          (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      )
    }
    previous.splice(0, previous.length, ...current)
  }

  return 1 - previous[right.length] / Math.max(left.length, right.length)
}

function cleanWebsiteDescription(value) {
  return String(value ?? '')
    .replace(/\.{2,}\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeCopy(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
