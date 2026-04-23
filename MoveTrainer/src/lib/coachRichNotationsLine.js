/**
 * Build Dream Opening–style `informationalSegments` items from a single `notation` string
 * (e.g. `unassisted` step `notation: '1. e4'`). Same pattern as
 * `informationalDreamOpening.js` — move number in `text`, SAN in `move` chip.
 *
 * @param {string} notation e.g. `'1. e4'`
 * @returns {Array<{ type: 'text', text: string } | { type: 'move', ply: number, san: string }>}
 */
export function notationsStringToRichSegments(notation) {
  const s = (notation || '').trim()
  if (!s) return []
  const m = s.match(/^(\d+)(\.\s+)(.+)$/)
  if (!m) {
    return [{ type: 'text', text: s }]
  }
  const ply = parseInt(m[1], 10)
  const san = m[3].trim()
  if (!Number.isFinite(ply) || !san) {
    return [{ type: 'text', text: s }]
  }
  return [
    { type: 'text', text: `${m[1]}${m[2]}` },
    { type: 'move', ply, san },
  ]
}
