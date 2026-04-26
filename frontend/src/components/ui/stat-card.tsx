import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon?: LucideIcon
  value: string | number
  label: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export function StatCard({ icon: Icon, value, label, sub, trend, trendValue, className }: StatCardProps) {
  return (
    <div className={cn('bg-paper2/50 rounded-lg border border-rule p-4', className)}>
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-sea/10 text-sea flex items-center justify-center mb-3">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="text-[28px] font-bold text-ink tracking-tighter leading-none">{value}</div>
      <div className="text-[12px] font-medium text-ink2 mt-1">{label}</div>
      {sub && <div className="text-[10px] text-ink3 mt-0.5">{sub}</div>}
      {trend && trendValue && (
        <div className={cn(
          'text-[10px] mt-2 flex items-center gap-1',
          trend === 'up' ? 'text-ok' : trend === 'down' ? 'text-crit' : 'text-ink3'
        )}>
          <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  icon?: LucideIcon
  title: string
  value: string | number
  badge?: string
  badgeVariant?: 'sea' | 'ok' | 'warn' | 'gold' | 'default'
  description?: string
  progress?: number
  className?: string
}

export function MetricCard({ icon: Icon, title, value, badge, badgeVariant = 'default', description, progress, className }: MetricCardProps) {
  return (
    <div className={cn('bg-paper rounded-lg border border-rule p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-ink3" />}
          <span className="text-[11px] uppercase tracking-wider text-ink3">{title}</span>
        </div>
        {badge && (
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full font-medium',
            badgeVariant === 'sea' && 'bg-sea/10 text-sea border border-sea/20',
            badgeVariant === 'ok' && 'bg-ok/10 text-ok border border-ok/20',
            badgeVariant === 'warn' && 'bg-warn/10 text-warn border border-warn/20',
            badgeVariant === 'gold' && 'bg-gold/10 text-gold border border-gold/20',
            badgeVariant === 'default' && 'bg-paper2 text-ink3 border border-rule',
          )}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-3 text-[36px] font-bold text-ink tracking-tighter leading-none">{value}</div>
      {description && <div className="text-[12px] text-ink2 mt-1">{description}</div>}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-paper2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-sea rounded-full transition-all" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} 
          />
        </div>
      )}
    </div>
  )
}

interface AlertCardProps {
  severity: 'critical' | 'warning' | 'info' | 'success'
  title: string
  description?: string
  institution?: string
  time?: string
  className?: string
}

const SEVERITY_STYLES = {
  critical: 'border-l-crit bg-crit/5',
  warning: 'border-l-warn bg-warn/5',
  info: 'border-l-sea bg-sea/5',
  success: 'border-l-ok bg-ok/5',
}

const SEVERITY_TEXT = {
  critical: 'text-crit',
  warning: 'text-warn',
  info: 'text-sea',
  success: 'text-ok',
}

export function AlertCard({ severity, title, description, institution, time, className }: AlertCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-rule border-l-4 p-4',
      SEVERITY_STYLES[severity],
      className
    )}>
      <div className="flex items-start justify-between">
        <span className={cn('text-[10px] uppercase tracking-wider font-medium', SEVERITY_TEXT[severity])}>
          {severity === 'critical' ? 'Critique' : severity === 'warning' ? 'Vigilance' : severity === 'info' ? 'Info' : 'Succès'}
        </span>
        {time && <span className="text-[10px] text-ink3">{time}</span>}
      </div>
      <div className="text-[14px] font-medium text-ink mt-1">{title}</div>
      {description && <div className="text-[12px] text-ink2 mt-1">{description}</div>}
      {institution && <div className="text-[11px] text-ink3 mt-2">→ {institution}</div>}
    </div>
  )
}