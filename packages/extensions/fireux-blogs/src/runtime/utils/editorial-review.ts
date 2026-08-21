import type { BlogPostCreateInput } from '../models/blogPost.model'

export type BlogEditorialFinding = {
  kind: 'blocker' | 'warning'
  message: string
}

const plainText = (value: unknown) =>
  String(value ?? '')
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll(/&nbsp;/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()

export function reviewBlogEditorialContent(
  post: Pick<BlogPostCreateInput, 'title' | 'content' | 'metaDescription'>
): BlogEditorialFinding[] {
  const text = [post.title, plainText(post.content), post.metaDescription].join(
    '\n'
  )
  const findings: BlogEditorialFinding[] = []
  const blockers = [
    {
      pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
      message: 'Remove email addresses before publication.',
    },
    {
      pattern: /\b(?:api[_-]?key|access[_-]?token|password|secret)\s*[:=]/i,
      message: 'Remove credentials or secret values before publication.',
    },
    {
      pattern:
        /https?:\/\/(?:localhost|127\.0\.0\.1|mail\.google\.com|calendar\.google\.com)\b/i,
      message: 'Remove private or local URLs before publication.',
    },
    {
      pattern: /\b(?:sk|AIza)[-_A-Za-z0-9]{16,}\b/,
      message: 'Remove possible API credentials before publication.',
    },
  ]

  for (const blocker of blockers) {
    if (blocker.pattern.test(text))
      findings.push({ kind: 'blocker', message: blocker.message })
  }

  const titleLength = plainText(post.title).length
  if (titleLength < 40 || titleLength > 70) {
    findings.push({
      kind: 'warning',
      message:
        'For search results, prefer a title between 40 and 70 characters.',
    })
  }

  const descriptionLength = plainText(post.metaDescription).length
  if (descriptionLength < 120 || descriptionLength > 170) {
    findings.push({
      kind: 'warning',
      message:
        'For search results, prefer a meta description between 120 and 170 characters.',
    })
  }

  return findings
}

export function assertBlogEditorialApproval(post: BlogPostCreateInput) {
  const findings = reviewBlogEditorialContent(post)
  const blockers = findings.filter((finding) => finding.kind === 'blocker')
  if (blockers.length)
    throw new Error(blockers.map((finding) => finding.message).join(' '))

  const review = post.editorial_review
  if (!review?.privacy_reviewed)
    throw new Error('Confirm the privacy review before publishing.')
  if (!review?.facts_reviewed)
    throw new Error('Confirm the factual review before publishing.')
  if (!review?.names_approved)
    throw new Error(
      'Confirm that every remaining name is approved for publication.'
    )

  return findings
}
