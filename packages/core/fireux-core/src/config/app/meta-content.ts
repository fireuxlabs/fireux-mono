import { createJiti } from 'jiti'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  FireuxMetaChecklistItem,
  FireuxMetaContent,
  FireuxMetaSolution,
} from './meta-content.types'

export type * from './meta-content.types'

/** Type-preserving helper for authored `app/meta.ts` configuration. */
export function defineFireuxMeta<const T extends FireuxMetaContent>(
  meta: T
): T {
  return meta
}

type FireuxSolutionMarkdownContent = Pick<
  FireuxMetaSolution,
  'body' | 'steps' | 'businessCase' | 'provisioning' | 'checklist'
>

export function loadFireuxAppMetaContent(
  explicitMeta?: FireuxMetaContent
): FireuxMetaContent | undefined {
  if (explicitMeta) return explicitMeta

  const appMeta = resolve(process.cwd(), 'app/meta.ts')
  if (!existsSync(appMeta)) {
    throw new Error(`[fireux] Missing required app meta file: ${appMeta}`)
  }

  try {
    const loadTypeScriptModule = createJiti(import.meta.url)
    const loaded = loadTypeScriptModule(appMeta) as {
      metaContent?: FireuxMetaContent
    }
    if (!loaded.metaContent) {
      throw new Error(
        `[fireux] App meta file must export metaContent: ${appMeta}`
      )
    }
    return loaded.metaContent
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `[fireux] Failed to load app meta from ${appMeta}: ${message}`
    )
  }
}

function normalizeSolutionSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeMarkdownBody(lines: string[]): string | undefined {
  const text = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text || undefined
}

function parseFireuxSolutionsMarkdown(
  markdown: string
): Record<string, FireuxSolutionMarkdownContent> {
  const out: Record<string, FireuxSolutionMarkdownContent> = {}
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let slug = ''
  let mode: 'body' | 'steps' | 'businessCase' | 'provisioning' | 'checklist' =
    'body'
  let bodyLines: string[] = []
  let steps: string[] = []
  let businessCaseLines: string[] = []
  let provisioning: string[] = []
  let checklist: FireuxMetaChecklistItem[] = []

  const flush = () => {
    if (!slug) return

    const body = normalizeMarkdownBody(bodyLines)
    const businessCase = normalizeMarkdownBody(businessCaseLines)
    out[slug] = {
      ...(body ? { body } : {}),
      ...(steps.length ? { steps } : {}),
      ...(businessCase ? { businessCase } : {}),
      ...(provisioning.length ? { provisioning } : {}),
      ...(checklist.length ? { checklist } : {}),
    }
  }

  for (const line of lines) {
    const solutionHeading = line.match(/^##\s+(.+?)\s*$/)
    if (solutionHeading) {
      flush()
      slug = normalizeSolutionSlug(solutionHeading[1] || '')
      mode = 'body'
      bodyLines = []
      steps = []
      businessCaseLines = []
      provisioning = []
      checklist = []
      continue
    }

    if (!slug) continue

    if (/^###\s+how this comes to life\s*$/i.test(line.trim())) {
      mode = 'steps'
      continue
    }

    if (/^###\s+business case\s*$/i.test(line.trim())) {
      mode = 'businessCase'
      continue
    }

    if (/^###\s+provisioning\s*$/i.test(line.trim())) {
      mode = 'provisioning'
      continue
    }

    if (/^###\s+checklist\s*$/i.test(line.trim())) {
      mode = 'checklist'
      continue
    }

    if (mode === 'steps') {
      const step = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+?)\s*$/)
      if (step?.[1]) steps.push(step[1].trim())
      continue
    }

    if (mode === 'businessCase') {
      businessCaseLines.push(line)
      continue
    }

    if (mode === 'provisioning' || mode === 'checklist') {
      const item = line.match(
        /^\s*(?:[-*]|\d+\.)\s+(?:\[( |x|X)\]\s*)?(.+?)\s*$/
      )
      if (item?.[2]) {
        const label = (item[2] || '').trim()
        if (!label) continue
        if (mode === 'provisioning') provisioning.push(label)
        else checklist.push({ label, done: item[1].toLowerCase() === 'x' })
      }
      continue
    }

    bodyLines.push(line)
  }

  flush()

  return out
}

export function loadFireuxSolutionsMarkdown(): Record<
  string,
  FireuxSolutionMarkdownContent
> {
  const solutionContentPath = resolve(process.cwd(), 'app/solutions.md')
  if (!existsSync(solutionContentPath)) return {}

  return parseFireuxSolutionsMarkdown(readFileSync(solutionContentPath, 'utf8'))
}

export function mergeFireuxSolutionMarkdownContent(
  meta: FireuxMetaContent | undefined,
  content: Record<string, FireuxSolutionMarkdownContent>
): FireuxMetaContent | undefined {
  if (!meta?.solutions?.length || !Object.keys(content).length) return meta

  return {
    ...meta,
    solutions: meta.solutions.map((solution) => {
      const markdown = content[solution.slug]
      if (!markdown) return solution

      return {
        ...solution,
        ...(markdown.body ? { body: markdown.body } : {}),
        ...(markdown.steps?.length ? { steps: markdown.steps } : {}),
        ...(markdown.businessCase
          ? { businessCase: markdown.businessCase }
          : {}),
        ...(markdown.provisioning?.length
          ? { provisioning: markdown.provisioning }
          : {}),
        ...(markdown.checklist?.length
          ? { checklist: markdown.checklist }
          : {}),
      }
    }),
  }
}
