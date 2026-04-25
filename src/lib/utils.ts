import { format, formatDistanceToNow } from 'date-fns'
import type { Plan } from '../types'

export function formatTime(iso: string): string {
  return format(new Date(iso), 'h:mm a')
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function formatCountdown(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'now'
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `in ${mins}m`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `in ${hrs}h ${rem}m` : `in ${hrs}h`
}

export function spotsLeft(plan: Plan): number {
  return Math.max(0, plan.groupSize - plan.members.length)
}

export function isFull(plan: Plan): boolean {
  return plan.members.length >= plan.groupSize
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
