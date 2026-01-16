import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface VersionTabsProps {
  versions: { content: string; fileName: string }[];
  activeComparison: [number, number];
  onComparisonChange: (comparison: [number, number]) => void;
}

export const VersionTabs = ({
  versions,
  activeComparison,
  onComparisonChange,
}: VersionTabsProps) => {
  const comparisons: { label: string; pair: [number, number] }[] = [];

  for (let i = 0; i < versions.length - 1; i++) {
    if (versions[i].content && versions[i + 1].content) {
      comparisons.push({
        label: `${i + 1} → ${i + 2}`,
        pair: [i, i + 1],
      });
    }
  }

  if (comparisons.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        နှိုင်းယှဉ်ရန်:
      </span>
      <div className="flex flex-wrap gap-2 p-1.5 bg-card rounded-xl border border-border shadow-soft">
        {comparisons.map((comparison, index) => {
          const isActive =
            activeComparison[0] === comparison.pair[0] &&
            activeComparison[1] === comparison.pair[1];
          return (
            <button
              key={index}
              onClick={() => onComparisonChange(comparison.pair)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                isActive
                  ? "gradient-warm text-primary-foreground shadow-glow"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <span>စာစစ် {comparison.pair[0] + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span>စာစစ် {comparison.pair[1] + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
