export const MOVE_CLASSIFICATIONS = {
  best:       { icon: 'classification-best',       label: 'Best' },
  excellent:  { icon: 'classification-excellent',  label: 'Excellent' },
  good:       { icon: 'classification-good',       label: 'Good' },
  brilliant:  { icon: 'classification-brilliant',  label: 'Brilliant' },
  great:      { icon: 'classification-great-find', label: 'Great' },
  book:       { icon: 'classification-book',       label: 'Book' },
  inaccuracy: { icon: 'classification-inaccuracy', label: 'Inaccuracy' },
  mistake:    { icon: 'classification-mistake',    label: 'Mistake' },
  miss:       { icon: 'classification-miss',       label: 'Miss' },
  blunder:    { icon: 'classification-blunder',    label: 'Blunder' },
}

const labelsByIcon = Object.fromEntries(
  Object.values(MOVE_CLASSIFICATIONS).map(c => [c.icon, c.label])
)

export function getClassificationLabel(iconName) {
  return labelsByIcon[iconName] || ''
}

export function getClassificationByKey(key) {
  return MOVE_CLASSIFICATIONS[key] || null
}
