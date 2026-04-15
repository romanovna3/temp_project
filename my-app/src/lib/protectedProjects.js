/**
 * Password-gated index entries and route protection (sessionStorage).
 *
 * Not real security: passwords ship in the client bundle. Use for casual
 * demos or obscuring routes from casual visitors only.
 */
export const PASSWORD_PROJECTS = [
  {
    id: 'chapter-v10',
    title: 'Chapter Page V10',
    path: '/courses/v10',
    versionKey: 'v10',
    /** Change to your own passphrase */
    password: 'demo',
  },
  {
    id: 'empty-page',
    title: 'Empty page',
    path: '/empty',
    versionKey: 'empty',
    password: 'demo',
  },
]

export function storageKey(projectId) {
  return `pp_unlock_${projectId}`
}

export function isUnlocked(projectId) {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(storageKey(projectId)) === '1'
}

export function unlockProject(projectId) {
  sessionStorage.setItem(storageKey(projectId), '1')
}

export function tryUnlockWithPassword(projectId, password) {
  const entry = PASSWORD_PROJECTS.find((p) => p.id === projectId)
  if (!entry) return false
  if (entry.password !== password) return false
  unlockProject(projectId)
  return true
}

export function getPasswordProjectById(id) {
  return PASSWORD_PROJECTS.find((p) => p.id === id) ?? null
}
