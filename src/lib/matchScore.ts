import type { UserProfile, Plan, MatchResult } from '../types'
import { MOCK_USERS } from './mockData'

export function scorePlan(user: UserProfile, plan: Plan): MatchResult {
  let score = 40 // base
  const reasons: string[] = []

  // Food preference overlap
  const foodOverlap = plan.restaurant.cuisines.filter(c =>
    user.foodPrefs.some(p => p.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(p.toLowerCase()))
  )
  if (foodOverlap.length > 0) {
    score += Math.min(foodOverlap.length * 15, 25)
    reasons.push(`matches your ${foodOverlap[0]} preference`)
  }

  // Budget match
  if (user.budget === plan.budget) {
    score += 15
    reasons.push('same budget range')
  } else if (
    (user.budget === '$$$' && plan.budget === '$$') ||
    (user.budget === '$$' && (plan.budget === '$' || plan.budget === '$$$'))
  ) {
    score += 5
  }

  // Vibe tag overlap
  const vibeOverlap = plan.vibeTags.filter(v => user.vibeTags.includes(v))
  if (vibeOverlap.length > 0) {
    score += Math.min(vibeOverlap.length * 10, 15)
    reasons.push(`${vibeOverlap[0]} vibe`)
  }

  // Mutual connections
  const host = MOCK_USERS.find(u => u.id === plan.hostId)
  if (host) {
    const mutuals = user.connections.filter(id => host.connections.includes(id))
    if (mutuals.length > 0) {
      score += Math.min(mutuals.length * 5, 10)
      reasons.push(`${mutuals.length} mutual${mutuals.length > 1 ? 's' : ''}`)
    }
  }

  // Host reliability bonus
  if (host && host.reliability >= 95) {
    score += 5
    reasons.push(`${host.reliability}% reliable host`)
  }

  // Group size pref
  const projectedSize = plan.members.length + 1
  if (projectedSize >= user.groupSizePref[0] && projectedSize <= user.groupSizePref[1]) {
    score += 5
  }

  return { plan, score: Math.min(score, 99), reasons }
}

export function rankPlans(user: UserProfile, plans: Plan[]): MatchResult[] {
  return plans
    .filter(p => !p.members.includes(user.id) && p.status === 'open')
    .map(p => scorePlan(user, p))
    .sort((a, b) => b.score - a.score)
}
