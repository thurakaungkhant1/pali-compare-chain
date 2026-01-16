import { diffWords } from "diff";
import { useMemo } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";

interface DiffViewerProps {
  leftContent: string;
  rightContent: string;
  leftLabel: string;
  rightLabel: string;
}

export const DiffViewer = ({
  leftContent,
  rightContent,
  leftLabel,
  rightLabel,
}: DiffViewerProps) => {
  const diffResult = useMemo(() => {
    return diffWords(leftContent, rightContent);
  }, [leftContent, rightContent]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffResult.forEach((part) => {
      if (part.added) added += part.value.length;
      if (part.removed) removed += part.value.length;
    });
    return { added, removed };
  }, [diffResult]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Stats Bar */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-t-2xl border border-border shadow-soft">
        <span className="text-sm font-semibold text-foreground">
          ပြောင်းလဲမှုများ
        </span>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-diff-added-bg">
            <Plus className="w-3.5 h-3.5 text-diff-added-text" />
            <span className="text-sm font-semibold text-diff-added-text">
              {stats.added}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-diff-removed-bg">
            <Minus className="w-3.5 h-3.5 text-diff-removed-text" />
            <span className="text-sm font-semibold text-diff-removed-text">
              {stats.removed}
            </span>
          </div>
        </div>
      </div>

      {/* Side by Side View */}
      <div className="grid grid-cols-2 gap-0 flex-1 border border-t-0 border-border rounded-b-2xl overflow-hidden shadow-soft-lg">
        {/* Left Panel */}
        <div className="flex flex-col border-r border-border bg-card">
          <div className="px-4 py-3 bg-muted/50 font-medium text-sm text-muted-foreground border-b border-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-diff-removed-bg border border-diff-removed-text/30" />
            <span className="truncate">{leftLabel}</span>
          </div>
          <div className="p-5 overflow-auto flex-1 text-foreground leading-[1.8] whitespace-pre-wrap font-[inherit]">
            {diffResult.map((part, index) => {
              if (part.added) return null;
              if (part.removed) {
                return (
                  <span
                    key={index}
                    className="bg-diff-removed-bg text-diff-removed-text px-1 py-0.5 rounded-md mx-0.5 decoration-diff-removed-text/50 line-through"
                  >
                    {part.value}
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col bg-card">
          <div className="px-4 py-3 bg-muted/50 font-medium text-sm text-muted-foreground border-b border-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-diff-added-bg border border-diff-added-text/30" />
            <span className="truncate">{rightLabel}</span>
          </div>
          <div className="p-5 overflow-auto flex-1 text-foreground leading-[1.8] whitespace-pre-wrap font-[inherit]">
            {diffResult.map((part, index) => {
              if (part.removed) return null;
              if (part.added) {
                return (
                  <span
                    key={index}
                    className="bg-diff-added-bg text-diff-added-text px-1 py-0.5 rounded-md mx-0.5 font-medium"
                  >
                    {part.value}
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
