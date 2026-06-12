function isValidJsIdentifier(value: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
}

export function toValidJsIdentifier(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'server'
  if (isValidJsIdentifier(trimmed)) return trimmed

  const parts = trimmed
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p.replace(/[^A-Za-z0-9]/g, ''))
    .filter(Boolean)

  let out = parts
    .map((p, i) => {
      const lower = p.toLowerCase()
      if (i === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')

  if (!out) out = 'server'
  if (!/^[A-Za-z_$]/.test(out)) out = `_${out}`
  out = out.replace(/[^A-Za-z0-9_$]/g, '_')

  return out
}
