const VERIFIED_USERNAMES = new Set(['yaso', 'buzly'])

export function isVerifiedUser(username: string | undefined | null): boolean {
  if (!username) return false
  return VERIFIED_USERNAMES.has(username.toLowerCase())
}
