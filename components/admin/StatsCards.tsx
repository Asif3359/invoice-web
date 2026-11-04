import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="gap-1.5 p-4 sm:p-5">
          <CardDescription>{stat.label}</CardDescription>
          <CardTitle className="text-2xl">{stat.value}</CardTitle>
          {stat.description && (
            <CardContent className="px-0 pt-1 text-xs text-muted-foreground">
              {stat.description}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
