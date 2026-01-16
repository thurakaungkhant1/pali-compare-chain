import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface ComparisonSelectorProps {
  versions: { content: string; fileName: string }[];
  activeComparison: [number, number];
  onComparisonChange: (comparison: [number, number]) => void;
}

export const ComparisonSelector = ({
  versions,
  activeComparison,
  onComparisonChange,
}: ComparisonSelectorProps) => {
  const availableVersions = versions
    .map((v, i) => ({ index: i, hasContent: !!v.content, fileName: v.fileName }))
    .filter((v) => v.hasContent);

  if (availableVersions.length < 2) {
    return null;
  }

  const handleLeftChange = (index: number) => {
    if (index !== activeComparison[1]) {
      onComparisonChange([index, activeComparison[1]]);
    }
  };

  const handleRightChange = (index: number) => {
    if (index !== activeComparison[0]) {
      onComparisonChange([activeComparison[0], index]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 animate-fade-in">
      <span className="text-sm font-medium text-muted-foreground">
        နှိုင်းယှဉ်ရန်:
      </span>
      
      <div className="flex items-center gap-2 p-1.5 bg-card rounded-xl border border-border shadow-soft">
        {/* Left selector */}
        <div className="relative">
          <select
            value={activeComparison[0]}
            onChange={(e) => handleLeftChange(Number(e.target.value))}
            className={cn(
              "appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200",
              "bg-diff-removed-bg text-diff-removed-text border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
            )}
          >
            {availableVersions.map((v) => (
              <option
                key={v.index}
                value={v.index}
                disabled={v.index === activeComparison[1]}
              >
                စာစစ် {v.index + 1}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-diff-removed-text pointer-events-none" />
        </div>

        <span className="text-muted-foreground font-medium">နှင့်</span>

        {/* Right selector */}
        <div className="relative">
          <select
            value={activeComparison[1]}
            onChange={(e) => handleRightChange(Number(e.target.value))}
            className={cn(
              "appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200",
              "bg-diff-added-bg text-diff-added-text border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
            )}
          >
            {availableVersions.map((v) => (
              <option
                key={v.index}
                value={v.index}
                disabled={v.index === activeComparison[0]}
              >
                စာစစ် {v.index + 1}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-diff-added-text pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
