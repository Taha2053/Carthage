interface PartnerCategory {
  title: string
  description: string
  partners: { name: string; detail: string; action: string }[]
}

export default function PartnershipGrid({ categories }: { categories: PartnerCategory[] }) {
  return (
    <div className="space-y-5">
      {categories.map((cat, i) => (
        <div key={i} className="rounded-xl border border-rule bg-paper p-5">
          <h4 className="font-display text-lg text-ink tracking-tighter2 mb-1">{cat.title}</h4>
          <p className="text-xs text-ink3 mb-4">{cat.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.partners.map((p, j) => (
              <div key={j} className="rounded-lg border border-rule bg-paper2/50 p-3">
                <p className="font-medium text-sm text-ink">{p.name}</p>
                <p className="text-xs text-ink3 mt-0.5">{p.detail}</p>
                <p className="text-xs text-sea mt-1.5 flex items-start gap-1">
                  <span>→</span> {p.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
