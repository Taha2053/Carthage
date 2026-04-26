import type { Health, Severity } from '@/types'

const HEALTH_CONFIG: Record<Health, { color: string; badge: string; labelKey: string; dot: string }> = {
  critical: {
    color: 'border-red-500 bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200',
    labelKey: 'health.critical',
    dot: 'bg-red-500',
  },
  warning: {
    color: 'border-amber-500 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    labelKey: 'health.warning',
    dot: 'bg-amber-500',
  },
  good: {
    color: 'border-emerald-500 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    labelKey: 'health.good',
    dot: 'bg-emerald-500',
  },
  no_data: {
    color: 'border-gray-300 bg-gray-50',
    badge: 'bg-gray-100 text-gray-500 border-gray-200',
    labelKey: 'health.noData',
    dot: 'bg-gray-400',
  },
}

const SEVERITY_CONFIG: Record<Severity, { icon: string; color: string }> = {
  critical: { icon: '🔴', color: 'text-red-600 bg-red-50 border-red-200' },
  warning: { icon: '🟡', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  info: { icon: '⚪', color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

export const healthToColor = (h: Health) => HEALTH_CONFIG[h].color
export const healthToBadgeColor = (h: Health) => HEALTH_CONFIG[h].badge
export const healthToLabelKey = (h: Health) => HEALTH_CONFIG[h].labelKey
export const healthToDot = (h: Health) => HEALTH_CONFIG[h].dot
export const severityToIcon = (s: Severity) => SEVERITY_CONFIG[s].icon
export const severityToColor = (s: Severity) => SEVERITY_CONFIG[s].color
