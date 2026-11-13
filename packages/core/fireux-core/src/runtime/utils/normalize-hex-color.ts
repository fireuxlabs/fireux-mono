export const normalizeHexColor = (value: unknown) => {
  const candidate = String(value ?? '').trim()
  if (!candidate) return ''
  return /^#[0-9a-f]{6}$/i.test(candidate) ? candidate.toLowerCase() : null
}
