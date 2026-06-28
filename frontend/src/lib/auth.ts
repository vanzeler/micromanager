import Cookies from 'js-cookie'

export interface User {
  id: string
  nome: string
  email: string
  perfil: 'administrador' | 'tecnico_ti' | 'gestor' | 'somente_leitura'
}

export function getUser(): User | null {
  const raw = Cookies.get('ti_user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function getToken(): string | null {
  return Cookies.get('ti_token') || null
}

export function setAuth(token: string, user: User) {
  Cookies.set('ti_token', token, { expires: 7 })
  Cookies.set('ti_user', JSON.stringify(user), { expires: 7 })
}

export function clearAuth() {
  Cookies.remove('ti_token')
  Cookies.remove('ti_user')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function hasRole(roles: string[]): boolean {
  const user = getUser()
  if (!user) return false
  return roles.includes(user.perfil)
}

export function isAdmin(): boolean {
  return hasRole(['administrador'])
}

export function isTecnico(): boolean {
  return hasRole(['administrador', 'tecnico_ti'])
}
