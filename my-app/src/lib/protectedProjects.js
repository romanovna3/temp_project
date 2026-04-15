/**
 * Password-gated folder unlock (sessionStorage).
 *
 * Not real security: passwords ship in the client bundle.
 */

/** Unlocks the "Previous versions" folder and routes listed under that folder guard. */
export const FOLDER_PREVIOUS_VERSIONS_ID = 'folder-previous-versions'

export const PASSWORD_PROJECTS = [
  {
    id: FOLDER_PREVIOUS_VERSIONS_ID,
    title: 'Previous versions',
    password: 'Unlock',
    /** After success, Index opens this folder instead of navigating to a route */
    isFolderUnlock: true,
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
