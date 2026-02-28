interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

interface StatsCardsProps {
  stats: StatCardProps[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
        >
          <div className="text-xs font-medium text-slate-400">
            {stat.label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-50">
            {stat.value}
          </div>
          {stat.description && (
            <div className="mt-1 text-xs text-slate-500">
              {stat.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

