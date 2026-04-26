interface Phase {
  label: string
  duration: string
  steps: string[]
  color: string
}

export default function CertificationTimeline({ phases, title }: { phases: Phase[]; title: string }) {
  return (
    <div className="rounded-xl border border-rule bg-paper p-5">
      <h4 className="font-display text-lg text-ink tracking-tighter2 mb-4">{title}</h4>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-rule" />

        <div className="space-y-6">
          {phases.map((phase, i) => (
            <div key={i} className="relative pl-8">
              {/* Dot */}
              <div
                className="absolute left-0 top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ borderColor: phase.color, background: phase.color }}
              >
                {i + 1}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h5 className="font-medium text-ink text-sm">{phase.label}</h5>
                  <span className="pill text-[10px]">{phase.duration}</span>
                </div>
                <ul className="space-y-1">
                  {phase.steps.map((s, j) => (
                    <li key={j} className="text-sm text-ink2 flex items-start gap-2">
                      <span className="text-ink3 mt-0.5">›</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
