import { cn } from "@/lib/utils";

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
        label: `စာစစ် ${i + 1} → စာစစ် ${i + 2}`,
        pair: [i, i + 1],
      });
    }
  }

  if (comparisons.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-xl">
      {comparisons.map((comparison, index) => (
        <button
          key={index}
          onClick={() => onComparisonChange(comparison.pair)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeComparison[0] === comparison.pair[0] &&
              activeComparison[1] === comparison.pair[1]
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-foreground hover:bg-secondary"
          )}
        >
          {comparison.label}
        </button>
      ))}
    </div>
  );
};
