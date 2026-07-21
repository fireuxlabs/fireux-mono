// @fireux-script
// last_used: 2026-07-21
// usage_note: fetch and deterministically parse the public Interlaken Pizza OpenCart menu for the read-only audit.
// Concurrent edit — 2026-07-21 23:18 CEST — Interlaken Pizza audit: add the public OpenCart source parser.

const DEFAULT_TIMEOUT_MS = 30_000

const HTML_ENTITIES = {
  amp: '&',
  apos: "'",
  copy: '©',
  eacute: 'é',
  gt: '>',
  laquo: '«',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  raquo: '»',
  szlig: 'ß',
  auml: 'ä',
  Auml: 'Ä',
  ouml: 'ö',
  Ouml: 'Ö',
  uuml: 'ü',
  Uuml: 'Ü',
}

export async function fetchInterlakenSource(
  url,
  { timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'FireUX-Interlaken-Menu-Audit/1.0',
      },
      redirect: 'follow',
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Menu source returned HTTP ${response.status}.`)
    }

    const html = await response.text()
    if (!html.trim()) throw new Error('Menu source returned an empty response.')

    return {
      fetchedAt: new Date().toISOString(),
      finalUrl: response.url || url,
      html,
      status: response.status,
    }
  } finally {
    clearTimeout(timeout)
  }
}

export function parseInterlakenMenuHtml(html, sourceUrl) {
  if (
    !html.includes('id="v-pills-tabContent"') ||
    !html.includes('index.php?route=') ||
    !html.includes('catalog/view/theme/')
  ) {
    throw new Error(
      'Menu source does not contain the expected OpenCart menu signatures.'
    )
  }
  const origin = new URL(sourceUrl).origin
  const parents = parseParentCategories(html)
  const parentBySubcategoryId = new Map()

  for (const parent of parents) {
    for (const subcategoryId of parent.subcategoryIds) {
      parentBySubcategoryId.set(subcategoryId, parent)
    }
  }

  const categoryMatches = [
    ...html.matchAll(
      /<div[^>]*class="[^"]*\btab-pane\b[^"]*"[^>]*id="v-pills-(\d+)"[^>]*>[\s\S]*?<h4>\s*([\s\S]*?)\s+\((\d+)\)\s*<\/h4>/g
    ),
  ]
  const categories = []
  const placements = []
  const warnings = []

  for (let index = 0; index < categoryMatches.length; index += 1) {
    const match = categoryMatches[index]
    const nextMatch = categoryMatches[index + 1]
    const subcategoryId = match[1]
    const parent = parentBySubcategoryId.get(subcategoryId)
    const category = {
      id: subcategoryId,
      name: stripHtml(match[2]),
      advertisedCount: Number(match[3]),
      parentId: parent?.id || '',
      parentName: parent?.name || '',
    }
    const categoryHtml = html.slice(
      match.index,
      nextMatch?.index ?? html.length
    )
    const rows = [
      ...categoryHtml.matchAll(
        /<li\s+class="list-group-item">([\s\S]*?)<\/li>/g
      ),
    ]
    let parsedCount = 0

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex]
      const rowHtml = row[1]
      const productId = firstCapture(
        rowHtml,
        /<input[^>]*name="product_id"[^>]*value="(\d+)"[^>]*>/
      )
      if (!productId) continue

      const nextRow = rows[rowIndex + 1]
      const productHtml = categoryHtml.slice(
        row.index,
        nextRow?.index ?? categoryHtml.length
      )
      const imageTag = firstCapture(
        rowHtml,
        /<div[^>]*class="[^"]*\bpro_list_img\b[^"]*"[^>]*>[\s\S]*?(<img[^>]*>)/
      )
      const imageAttributes = parseAttributes(imageTag)
      const imageUrl = absoluteUrl(imageAttributes.src, origin)
      const name = stripHtml(firstCapture(rowHtml, /<h2>([\s\S]*?)<\/h2>/))
      const description = stripHtml(firstCapture(rowHtml, /<p>([\s\S]*?)<\/p>/))
      const displayedPrice = readMoney(
        stripHtml(firstCapture(rowHtml, /<h3>([\s\S]*?)<\/h3>/))
      )
      const corePrice = readMoney(
        firstCapture(
          productHtml,
          /<input[^>]*name="core_price"[^>]*value="([^"]+)"[^>]*>/
        )
      )

      placements.push({
        category,
        corePrice: corePrice ?? displayedPrice,
        description,
        displayedPrice,
        imageAlt: stripHtml(imageAttributes.alt),
        imageUrl,
        name,
        optionGroups: parseOptionGroups(productHtml),
        productId,
        productUrl: `${origin}/index.php?route=product/product&product_id=${encodeURIComponent(productId)}`,
      })
      parsedCount += 1
    }

    categories.push({
      ...category,
      parsedCount,
    })

    if (parsedCount !== category.advertisedCount) {
      warnings.push(
        `Category ${category.name} advertises ${category.advertisedCount} rows but parsed ${parsedCount}.`
      )
    }
  }

  const productsById = new Map()
  for (const placement of placements) {
    const existing = productsById.get(placement.productId)
    if (!existing) {
      productsById.set(placement.productId, {
        websiteProductId: placement.productId,
        websiteName: placement.name,
        description: placement.description,
        price: placement.corePrice,
        displayedPrice: placement.displayedPrice,
        optionGroups: placement.optionGroups,
        imageUrl: placement.imageUrl,
        imageAlt: placement.imageAlt,
        productUrl: placement.productUrl,
        categories: [placement.category],
        placementCount: 1,
        sourceConflicts: [],
      })
      continue
    }

    existing.categories.push(placement.category)
    existing.placementCount += 1

    for (const [field, value] of [
      ['websiteName', placement.name],
      ['description', placement.description],
      ['price', placement.corePrice],
      ['displayedPrice', placement.displayedPrice],
      ['imageUrl', placement.imageUrl],
      ['optionGroups', placement.optionGroups],
    ]) {
      if (!sameSourceValue(existing[field], value)) {
        existing.sourceConflicts.push({
          categoryId: placement.category.id,
          field,
          first: existing[field],
          next: value,
        })
      }
    }
  }

  const products = [...productsById.values()].sort(
    (left, right) =>
      Number(left.websiteProductId) - Number(right.websiteProductId)
  )

  if (
    !parents.length ||
    !categories.length ||
    !placements.length ||
    !products.length
  ) {
    throw new Error(
      'Menu source did not contain the expected parent, category, placement, and product records.'
    )
  }

  return {
    categories,
    parentCategories: parents,
    placements,
    products,
    duplicatePlacements: products
      .filter((product) => product.placementCount > 1)
      .map((product) => ({
        websiteProductId: product.websiteProductId,
        websiteName: product.websiteName,
        categories: product.categories.map((category) => category.name),
        placementCount: product.placementCount,
      })),
    warnings,
  }
}

function sameSourceValue(left, right) {
  if (typeof left === 'object' || typeof right === 'object') {
    return JSON.stringify(left) === JSON.stringify(right)
  }
  return left === right
}

function parseParentCategories(html) {
  const navigationEnd = html.indexOf('id="v-pills-tabContent"')
  const navigationHtml =
    navigationEnd >= 0 ? html.slice(0, navigationEnd) : html
  const matches = [
    ...navigationHtml.matchAll(
      /<h2[^>]*class="[^"]*\baccordion-header\b[^"]*"[^>]*id="heading(\d+)"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/g
    ),
  ]

  return matches.map((match, index) => {
    const next = matches[index + 1]
    const section = navigationHtml.slice(
      match.index,
      next?.index ?? navigationHtml.length
    )
    const subcategoryIds = [...section.matchAll(/id="v-pills-(\d+)-tab"/g)].map(
      (entry) => entry[1]
    )

    return {
      id: match[1],
      name: stripHtml(match[2]),
      subcategoryIds: [...new Set(subcategoryIds)],
    }
  })
}

function parseOptionGroups(productHtml) {
  const headings = [
    ...productHtml.matchAll(
      /<h5[^>]*class="[^"]*\bmy-3\b[^"]*"[^>]*>([\s\S]*?)<\/h5>/g
    ),
  ]

  return headings
    .map((heading, index) => {
      const headingEnd = heading.index + heading[0].length
      const nextHeading = headings[index + 1]?.index ?? productHtml.length
      const nextRule = productHtml.indexOf('<hr', headingEnd)
      const groupEnd =
        nextRule >= 0 ? Math.min(nextRule, nextHeading) : nextHeading
      const groupHtml = productHtml.slice(headingEnd, groupEnd)
      const inputs = [
        ...groupHtml.matchAll(/<input[^>]*data-price="[^"]+"[^>]*>/g),
      ]
      const options = inputs.map((input) => {
        const attributes = parseAttributes(input[0])
        const labelPattern = attributes.id
          ? new RegExp(
              `<label[^>]*for="${escapeRegExp(attributes.id)}"[^>]*>([\\s\\S]*?)<\\/label>`
            )
          : null
        const rawLabel = labelPattern
          ? firstCapture(groupHtml, labelPattern)
          : ''
        const label = stripHtml(rawLabel)
          .replace(/\[\s*[+-]?\s*CHF\s*[\d.,]+\s*\]\s*$/i, '')
          .trim()

        return {
          id: attributes.value || attributes.id || '',
          inputType: attributes.type || '',
          label,
          priceDelta: readMoney(attributes['data-price']) ?? 0,
          required: Object.hasOwn(attributes, 'required'),
        }
      })

      return {
        id: firstCapture(groupHtml, /id="input-option(\d+)"/),
        label: stripHtml(heading[1]).replace(/:\s*$/, ''),
        options,
      }
    })
    .filter((group) => group.label && group.options.length)
}

function parseAttributes(tag) {
  const attributes = {}
  for (const match of String(tag || '').matchAll(
    /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
  )) {
    const key = match[1]
    if (key.toLowerCase() === 'input' || key.toLowerCase() === 'img') continue
    attributes[key] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '')
  }
  return attributes
}

function absoluteUrl(value, origin) {
  const decoded = decodeHtml(value).trim()
  if (!decoded) return ''
  try {
    return new URL(decoded, origin).href
  } catch {
    return ''
  }
}

function firstCapture(value, pattern) {
  return String(value || '').match(pattern)?.[1] || ''
}

function readMoney(value) {
  const cleaned = String(value ?? '')
    .replace(/[^\d.,-]+/g, '')
    .replace(',', '.')
  if (!cleaned) return null
  const amount = Number(cleaned)
  return Number.isFinite(amount) ? amount : null
}

function decodeHtml(value) {
  return String(value ?? '').replace(
    /&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi,
    (entity, body) => {
      if (body.startsWith('#x') || body.startsWith('#X')) {
        const codePoint = Number.parseInt(body.slice(2), 16)
        return Number.isFinite(codePoint)
          ? String.fromCodePoint(codePoint)
          : entity
      }
      if (body.startsWith('#')) {
        const codePoint = Number.parseInt(body.slice(1), 10)
        return Number.isFinite(codePoint)
          ? String.fromCodePoint(codePoint)
          : entity
      }
      return HTML_ENTITIES[body] ?? HTML_ENTITIES[body.toLowerCase()] ?? entity
    }
  )
}

function stripHtml(value) {
  return decodeHtml(
    String(value ?? '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
