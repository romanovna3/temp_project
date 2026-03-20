/**
 * Validates OPENING_FIRST_10_MOVES with chess.js (10 full moves per opening).
 * Run: node scripts/validate-opening-lines.mjs
 */
import { Chess } from 'chess.js'
import { OPENING_FIRST_10_MOVES } from '../src/data/openingFirst10Moves.js'

function validate(name, pairs) {
  const c = new Chess()
  for (let i = 0; i < pairs.length; i++) {
    const { white: w, black: b } = pairs[i]
    let m1
    try {
      m1 = c.move(w)
    } catch {
      m1 = null
    }
    if (!m1) return `${name} white ${i + 1} "${w}" illegal (fen ${c.fen()})`
    if (b) {
      let m2
      try {
        m2 = c.move(b)
      } catch {
        m2 = null
      }
      if (!m2) return `${name} black ${i + 1} "${b}" illegal (fen ${c.fen()})`
    }
  }
  if (pairs.length !== 10) return `${name} expected 10 pairs, got ${pairs.length}`
  return null
}

let errors = 0
for (const [name, pairs] of Object.entries(OPENING_FIRST_10_MOVES)) {
  const err = validate(name, pairs)
  if (err) {
    console.error(err)
    errors++
  }
}
if (errors) process.exit(1)
console.log('All', Object.keys(OPENING_FIRST_10_MOVES).length, 'lines OK (10 full moves each)')
