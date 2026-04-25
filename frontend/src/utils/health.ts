import type { Health, Severity } from '@/types'

export const healthToColor = (health: Health) => {
  switch (health) {
    case 'critical': return 'border-red-500 bg-red-50'
    case 'warning': return 'border-amber-500 bg-amber-50'
    case 'good': return 'border-emerald-500 bg-emerald-50'
    case 'no_data': return 'border-gray-300 bg-gray-50'
  }
}

export const healthToBadgeColor = (health: Health) => {
  switch (health) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200'
    case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'good': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'no_data': return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

export const healthToLabel = (health: Health) => {
  switch (health) {
    case 'critical': return 'Critique'
    case 'warning': return 'Attention'
    case 'good': return 'Bon'
    case 'no_data': return 'Sans données'
  }
}

export const healthToDot = (health: Health) => {
  switch (health) {
    case 'critical': return 'bg-red-500'
    case 'warning': return 'bg-amber-500'
    case 'good': return 'bg-emerald-500'
    case 'no_data': return 'bg-gray-400'
  }
}

export const severityToIcon = (severity: Severity) => {
  switch (severity) {
    case 'critical': return '🔴'
    case 'warning': return '🟡'
    case 'info': return '⚪'
  }
}

export const severityToColor = (severity: Severity) => {
  switch (severity) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    case 'warning': return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'info': return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}
